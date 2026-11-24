import { TOOL_BY_NAME } from './catalog.js'
import { db, shell, refresh } from './store.js'
import { write, confirm, readExtra } from './actions.js'
import { record, addPending, getPending, resolvePending } from './activity.js'

/* Tool bodies. Each one reads the shared gym store and returns short JSON with ids. */

const money = (n) => Math.round(n * 100) / 100
const monthStart = (iso) => `${iso.slice(0, 7)}-01`

function person(id) {
  const p = shell().person(id)
  if (!p) throw new Error(`No contact with id "${id}". Use contacts.search to find the id.`)
  return p
}

function isDroppedDuplicate(p) {
  const d = shell().dupOf(p.id)
  return !!(d && d.drop === p.id)
}

function brief(p) {
  const M = shell()
  return {
    contact_id: p.id,
    name: p.name,
    status: M.status(p),
    coach: p.coach || null,
    phone: p.phone || null,
    email: p.email || null,
    ...(M.dupOf(p.id) ? { possible_duplicate: true } : {}),
  }
}

function coverage(p, a) {
  if (a.plan) {
    const pl = p.plans.find((x) => x.id === a.plan)
    return pl ? `Covered by ${pl.name}` : 'Covered by a plan'
  }
  if (a.free) return 'Free'
  if (a.due && !a.paid) return `$${a.due.toFixed(2)} due`
  if (a.due) return `Paid $${a.due.toFixed(2)}`
  return null
}

function daysBetween(from, to) {
  const M = shell()
  const out = []
  for (let d = from; d <= to && out.length < 14; d = M.addDays(d, 1)) out.push(d)
  return out
}

function dayLabel(iso) {
  const DB = db()
  if (iso === DB.TODAY) return 'Today'
  const [y, m, d] = iso.split('-').map(Number)
  const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
  return `${dow}, ${shell().fd(iso)}`
}

function visitISO(label) {
  return shell().dayISO(label)
}

const run = {
  'contacts.search'({ query, status, limit = 20 }) {
    const M = shell()
    const q = (query || '').trim().toLowerCase()
    const hits = M.people().filter((p) => {
      if (status && M.status(p) !== status) return false
      if (!q) return true
      return `${p.name} ${p.email} ${p.phone}`.toLowerCase().includes(q)
    })
    return { count: hits.length, contacts: hits.slice(0, limit).map(brief) }
  },

  'contacts.get'({ contact_id }) {
    const M = shell()
    const p = person(contact_id)
    const hh = M.household(p)
    return {
      ...brief(p),
      source: p.source,
      added: p.added,
      tags: p.tags,
      replies_by: p.replies,
      texts_allowed: p.textOk,
      card_on_file: p.card || null,
      household: hh ? { name: hh.name, members: hh.members.map((m) => ({ contact_id: m.id, name: m.n, pays: !!m.pays })) } : null,
      plans: p.plans.map((pl) => ({
        name: pl.name,
        kind: pl.kind,
        price: pl.price,
        next_charge: pl.next || null,
        credits: pl.unlimited ? 'Unlimited' : { left_to_book: pl.open, booked: pl.booked, used: pl.used },
      })),
      upcoming: p.appts
        .filter((a) => a.status === 'booked')
        .map((a) => ({ id: a.id, day: a.day, time: a.time, title: a.title, where: a.where, coverage: coverage(p, a) })),
      open_payment_links: p.links.map((l) => `${l.text}. ${l.meta}`),
      documents: p.docs.map((d) => ({ name: d.name, status: d.status, when: d.when })),
      coaching: p.coaching || null,
      milton_notes: p.read,
    }
  },

  'packages.list'({ service }) {
    const DB = db()
    const items = DB.ITEMS.filter((i) => i.kind !== 'product' && (!service || i.svc.toLowerCase() === service.toLowerCase()))
    return {
      packages: items.map((i) => ({
        package_id: i.id,
        service: i.svc,
        name: i.name,
        kind: i.kind,
        price: i.price,
        per: i.per || null,
        sessions: i.unlimited ? 'Unlimited' : i.size || null,
      })),
      bundles: service
        ? []
        : (DB.bundles || []).map((b) => ({ package_id: b.id, name: b.name, price: b.price, status: b.status, sold_online: b.online, includes: b.items })),
    }
  },

  'packages.get'({ package_id }) {
    const DB = db()
    const M = shell()
    const bundle = (DB.bundles || []).find((b) => b.id === package_id)
    if (bundle) return { package_id, kind: 'bundle', ...bundle }
    const i = DB.ITEMS.find((x) => x.id === package_id)
    if (!i) throw new Error(`No package with id "${package_id}". Use packages.list.`)
    const names = [i.name, `${i.svc} ${i.name}`].map((s) => s.toLowerCase())
    const holders = M.people().filter((p) => p.plans.some((pl) => names.includes(pl.name.toLowerCase())))
    return {
      package_id: i.id,
      service: i.svc,
      name: i.name,
      description: i.sub,
      kind: i.kind,
      price: i.price,
      per: i.per || null,
      sessions: i.unlimited ? 'Unlimited' : i.size || null,
      held_by: holders.map((p) => ({ contact_id: p.id, name: p.name })),
    }
  },

  'schedule.list_sessions'({ from, to, coach_id }) {
    const DB = db()
    const M = shell()
    const coach = coach_id ? DB.TEAM.find((t) => t.id === coach_id) : null
    return {
      days: daysBetween(from, to || from).map((iso) => {
        const groups = new Map()
        M.sessionsOn(iso).forEach(({ p, a }) => {
          if (coach && !a.where.includes(M.first(coach.name))) return
          const key = `${a.time}|${a.title}|${a.where}`
          if (!groups.has(key)) groups.set(key, { time: a.time, title: a.title, where: a.where, people: [] })
          groups.get(key).people.push({
            contact_id: p.id,
            name: p.name,
            booking_id: a.id,
            status: M.apptLabel[a.status] || a.status,
            coverage: coverage(p, a),
          })
        })
        const sessions = [...groups.values()]
        return { date: iso, label: dayLabel(iso), session_count: sessions.length, sessions }
      }),
    }
  },

  'schedule.get_availability'({ service_id, date }) {
    const DB = db()
    const M = shell()
    const s = DB.SERVICES.find((x) => x.id === service_id)
    if (!s) throw new Error(`No service "${service_id}". Services: ${DB.SERVICES.map((x) => x.id).join(', ')}.`)
    const label = dayLabel(date)
    const closed = DB.overrides.find((o) => o[2] === 'Closed' && o[1].startsWith('Whole gym') && o[0] === label)
    if (closed) return { service: s.name, date, closed: true, reason: closed[1] }
    const booked = M.sessionsOn(date).filter(({ a }) => a.title === s.title && a.status !== 'canceled')
    const times = s.times
      .filter((t) => date !== DB.TODAY || M.toMin(t) > DB.NOW)
      .map((t) => ({ time: t, booked: booked.filter(({ a }) => a.time === t).length }))
    return { service: s.name, service_id: s.id, date, label, where: s.where, drop_in_price: s.price, times }
  },

  'inbox.list_threads'({ filter = 'all' }) {
    const M = shell()
    const MSG = { in: 1, out: 1, milton: 1, auto: 1, call: 1 }
    const threads = M.people()
      .filter((p) => p.thread.length && !isDroppedDuplicate(p))
      .map((p) => {
        const last = [...p.thread].reverse().find((i) => MSG[i.k]) || p.thread[p.thread.length - 1]
        return {
          contact_id: p.id,
          name: p.name,
          needs_reply: M.needsReply(p),
          milton_handling: !!(p.milton || p.miltonBooked),
          handed_off: p.handoff ? p.handoff.reason : null,
          last: last ? { kind: last.k, day: last.day, time: last.t, text: last.body || last.title } : null,
        }
      })
      .filter((t) => filter === 'all' || (filter === 'needs_reply' ? t.needs_reply : t.milton_handling))
    return { count: threads.length, threads }
  },

  'inbox.get_thread'({ contact_id, limit = 15 }) {
    const p = person(contact_id)
    return {
      contact_id: p.id,
      name: p.name,
      needs_reply: shell().needsReply(p),
      items: p.thread.slice(-limit).map((i) => ({
        kind: i.k,
        day: i.day,
        time: i.t,
        channel: i.ch || null,
        by: i.by || (i.k === 'milton' ? 'Milton' : i.src || null),
        text: i.title ? `${i.title}. ${i.body || ''}`.trim() : i.body,
      })),
    }
  },

  'payments.list_transactions'({ from, to, contact_id, status = 'all' }) {
    const M = shell()
    const rows = (db().tx || [])
      .filter((t) => t.iso >= from && t.iso <= to && (!contact_id || t.pid === contact_id))
      .filter((t) =>
        status === 'all' ? true : status === 'failed' ? t.fail : status === 'refunded' ? t.refunded > 0 : !t.fail,
      )
      .sort((a, b) => (a.iso < b.iso ? 1 : -1))
    return {
      count: rows.length,
      transactions: rows.slice(0, 40).map((t) => ({
        transaction_id: t.id,
        date: t.iso,
        contact_id: t.pid,
        name: M.person(t.pid)?.name || null,
        item: t.item,
        amount: t.paid,
        method: t.meth,
        source: t.src,
        status: t.status,
        refunded: t.refunded || 0,
      })),
    }
  },

  'payments.list_failed'({ from, to }) {
    const DB = db()
    return run['payments.list_transactions']({
      from: from || monthStart(DB.TODAY),
      to: to || DB.TODAY,
      status: 'failed',
    })
  },

  'leads.list'({ stage }) {
    const M = shell()
    const leads = M.people()
      .filter((p) => M.stageOf(p) && !isDroppedDuplicate(p))
      .map((p) => ({
        contact_id: p.id,
        name: p.name,
        stage: p.custom || M.stageOf(p),
        source: p.source,
        added: p.added,
        owner: p.owner || null,
        milton_handling: !!(p.milton || p.miltonBooked),
        last_touch: p.lastTouch,
      }))
      .filter((l) => !stage || l.stage.toLowerCase() === stage.toLowerCase())
    return { count: leads.length, leads }
  },

  'leads.get'({ contact_id }) {
    const M = shell()
    const p = person(contact_id)
    return {
      ...brief(p),
      stage: p.custom || M.stageOf(p) || null,
      source: p.source,
      added: p.added,
      owner: p.owner || null,
      last_touch: p.lastTouch,
      form: p.form ? { name: p.form.name, when: p.form.when, answers: p.form.qa.map(([q, a]) => ({ q, a })) } : null,
      milton_notes: p.read,
    }
  },

  'workflows.list'({ status }) {
    return {
      workflows: db()
        .workflows.filter((w) => !status || w.status === status)
        .map((w) => ({
          workflow_id: w.id,
          name: w.name,
          status: w.status,
          description: w.desc,
          starts: w.starts,
          people: w.people,
          runs: w.runs,
          steps: w.steps.map(([kind, detail]) => ({ kind, detail })),
        })),
    }
  },

  'workflows.list_templates'() {
    return { templates: db().templates.map(([name, description, shape]) => ({ name, description, shape })) }
  },

  'reports.revenue'({ from, to, group_by = 'none' }) {
    const M = shell()
    const rows = (db().tx || []).filter((t) => t.iso >= from && t.iso <= to)
    const collected = rows.filter((t) => !t.fail)
    const key = {
      item: (t) => t.item,
      team_member: (t) => t.tm || t.sold || 'Nobody',
      source: (t) => t.src,
      day: (t) => t.iso,
    }[group_by]
    const total = money(collected.reduce((s, t) => s + t.paid - (t.refunded || 0), 0))
    const out = {
      from,
      to,
      total,
      payments: collected.length,
      failed: rows.filter((t) => t.fail).length,
      refunded: money(collected.reduce((s, t) => s + (t.refunded || 0), 0)),
    }
    if (key) {
      const g = {}
      collected.forEach((t) => {
        const k = key(t)
        g[k] = money((g[k] || 0) + t.paid - (t.refunded || 0))
      })
      out.groups = Object.entries(g)
        .sort((a, b) => b[1] - a[1])
        .map(([name, amount]) => ({ name, amount }))
    }
    return out
  },

  'reports.attendance'({ from, to }) {
    const M = shell()
    const by = {}
    const tally = (service, status) => {
      by[service] = by[service] || { checked_in: 0, late_cancel: 0, no_show: 0 }
      if (/late/i.test(status)) by[service].late_cancel++
      else if (/no show/i.test(status)) by[service].no_show++
      else by[service].checked_in++
    }
    M.people().forEach((p) => {
      p.visits.forEach((v) => {
        const iso = visitISO(v[0])
        if (iso >= from && iso <= to) tally(v[2].replace(/, Day Pass$/, ''), v[3])
      })
    })
    const services = Object.entries(by).map(([service, n]) => ({ service, ...n }))
    const sum = (k) => services.reduce((s, x) => s + x[k], 0)
    return { from, to, checked_in: sum('checked_in'), late_cancel: sum('late_cancel'), no_show: sum('no_show'), services }
  },
}

Object.assign(run, readExtra)

/* Runs a confirmed plan, records it in Activity and redraws the screens. */
export function applyPending(id, asked, values = {}) {
  const p = getPending(id)
  if (!p || p.state !== 'waiting') return null
  try {
    const out = p.apply(values)
    record({ asked, tool: p.tool, summary: out.summary, undo: out.undo ? () => (out.undo(), refresh()) : null })
    resolvePending(id, 'done', out.summary, { show: out.show })
    refresh()
    return out
  } catch (e) {
    resolvePending(id, 'failed', e.message)
    return null
  }
}

export async function runTool(name, input, asked = '') {
  const def = TOOL_BY_NAME[name]
  const body = run[name] || write[name] || confirm[name]
  if (!def || !body) return { error: `Unknown tool ${name}` }
  const parsed = def.input.safeParse(input ?? {})
  if (!parsed.success) return { error: `Invalid input: ${parsed.error.issues.map((i) => i.message).join('; ')}` }
  try {
    if (def.tier === 'write') {
      const out = body(parsed.data)
      if (out.summary) record({ asked, tool: name, summary: out.summary, undo: out.undo ? () => (out.undo(), refresh()) : null })
      refresh()
      return out.summary ? { ...out.result, done: out.summary, can_undo: !!out.undo, show: out.show } : out.result
    }
    if (def.tier === 'confirm') {
      const plan = body(parsed.data)
      const id = addPending({ ...plan, tool: name })
      return {
        status: 'waiting_for_owner',
        confirmation_id: id,
        shown_to_owner: plan.title,
        action_button: plan.action || 'Confirm',
        ...(plan.fields?.length && {
          fields_on_card: plan.fields.map((f) => ({ field: f.label, filled_in: f.value || null, required: !!f.required })),
        }),
        note:
          'A card is on screen. Nothing has happened yet. Tell the owner to tap the action button, and do not say it is done.' +
          (plan.fields?.some((f) => f.required && !f.value) ? ' Some required fields are empty: ask the owner for them, they can fill them in on the card.' : ''),
      }
    }
    return await body(parsed.data, asked)
  } catch (e) {
    return { error: e.message }
  }
}
