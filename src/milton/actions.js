import { db, shell, refresh } from './store.js'
import { setupState, SETUP_STEPS } from './setup.js'
import { logGap } from './activity.js'

/*
 * Write tools return { result, summary, show, undo }. Confirm tools return a
 * plan, { title, lines, apply }, that only runs after the owner taps Confirm.
 * show is the screen and record the change landed on (see reveal.js).
 */

const contactShow = (id) => ({ page: 'crm', tab: 'contacts', id })
const workflowShow = (id) => ({ page: 'crm', tab: 'workflows', id })
const packageShow = (item) => ({ page: 'services', tab: item.kind === 'membership' ? 'subs' : 'passes', id: item.id })

const money = (n) => `$${n.toFixed(2)}`
const nowLabel = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

function person(id) {
  const p = shell().person(id)
  if (!p) throw new Error(`No contact with id "${id}". Use contacts.search to find the id.`)
  return p
}
function service(id) {
  const s = db().SERVICES.find((x) => x.id === id)
  if (!s) throw new Error(`No service with id "${id}".`)
  return s
}
function workflow(id) {
  const w = db().workflows.find((x) => x.id === id)
  if (!w) throw new Error(`No workflow with id "${id}". Use workflows.list.`)
  return w
}
/* The same session functions the Session Panel buttons call (public/legacy/sched.js). */
const ops = () => shell().sessOps

const STATUS = { booked: 'booked', checked_in: 'in', checked_out: 'out', late_cancel: 'late', no_show: 'noshow', canceled: 'canceled' }

function booking(contactId, bookingId) {
  const p = person(contactId)
  const hit = shell().sess.find(`${p.id}|${bookingId}`)
  if (!hit) throw new Error(`No booking ${bookingId} for ${p.name}. Use contacts.get or schedule.list_sessions for booking ids.`)
  return hit
}

const short = (a) => a.title.replace(/, \d+ min/, '')
const sessionShow = (p, a) => ({ page: 'schedule', date: shell().dayISO(a.day), id: p.id, session: [p.id, a.id] })

/* Undo for session tools: puts the person's bookings, history, credits and payments back. */
function snapshot(p, a) {
  const before = {
    a: { ...a },
    appts: [...p.appts],
    visits: [...p.visits],
    plans: p.plans.map((pl) => ({ ...pl })),
    tx: [...(p.tx || [])],
    thread: p.thread.length,
  }
  return () => {
    Object.keys(a).forEach((k) => delete a[k])
    Object.assign(a, before.a)
    p.appts = before.appts
    p.visits = before.visits
    p.plans.forEach((pl, i) => before.plans[i] && Object.assign(pl, before.plans[i]))
    if (p.tx) p.tx = before.tx
    p.thread.length = before.thread
  }
}

const remove = (list, item) => {
  const i = list.indexOf(item)
  if (i >= 0) list.splice(i, 1)
}
const normal = (s) => (s || '').toLowerCase().replace(/[^a-z0-9@.]/g, '')

function findSame(row) {
  return shell()
    .people()
    .find(
      (p) =>
        (row.email && normal(p.email) === normal(row.email)) ||
        (row.phone && normal(p.phone) === normal(row.phone)) ||
        normal(p.name) === normal(row.name),
    )
}

function newPerson({ name, phone, email, source }) {
  const DB = db()
  const p = {
    id: `c${Date.now()}${Math.floor(Math.random() * 1000)}`,
    name,
    phone: phone || null,
    email: email || null,
    source: source || 'Added by Milton',
    added: DB.TODAY,
    status: 'Lead',
  }
  DB.people.push(p)
  return shell().person(p.id)
}

/* The member list the prototype pretends the owner uploaded. */
export const SAMPLE_IMPORT = [
  { name: 'Dana Whitfield', email: 'dana.whitfield@gmail.com', phone: '(316) 555-0142' },
  { name: 'Billy Tran', phone: '(316) 555-0177' },
  { name: 'Grace Nakamura', email: 'grace.n@outlook.com', phone: '(316) 555-0193' },
  { name: 'Omar Haddad', email: 'omar.haddad@gmail.com', phone: '(316) 555-0121' },
  { name: 'Tess Lindqvist', email: 'tess.l@icloud.com' },
  { name: 'Ray Delgado', phone: '(316) 555-0168' },
]

export const write = {
  'contacts.create'(input) {
    const same = findSame(input)
    if (same) throw new Error(`${same.name} is already in the CRM as ${same.id}. Use that contact.`)
    const p = newPerson(input)
    return {
      result: { contact_id: p.id, name: p.name, status: 'Lead' },
      summary: `Added ${p.name} as a Lead`,
      show: contactShow(p.id),
      undo: () => remove(db().people, p),
    }
  },

  'contacts.update'({ contact_id, status, coach, phone, email, add_tags }) {
    const p = person(contact_id)
    const before = { status: p.status, coach: p.coach, phone: p.phone, email: p.email, tags: [...p.tags] }
    const changed = []
    if (status) (p.status = status), changed.push(`status to ${status}`)
    if (coach) (p.coach = coach === 'None' ? null : coach), changed.push(`coach to ${coach}`)
    if (phone) (p.phone = phone), changed.push('phone')
    if (email) (p.email = email), changed.push('email')
    if (add_tags?.length) (p.tags = [...new Set([...p.tags, ...add_tags])]), changed.push(`tags ${add_tags.join(', ')}`)
    if (!changed.length) throw new Error('Nothing to change.')
    return {
      result: { contact_id, changed },
      summary: `Changed ${p.name}'s ${changed.join(', ')}`,
      show: contactShow(contact_id),
      undo: () => Object.assign(p, before),
    }
  },

  'contacts.add_note'({ contact_id, note }) {
    const p = person(contact_id)
    const entry = { k: 'note', day: 'Today', t: nowLabel(), body: note, by: 'Milton' }
    p.thread.push(entry)
    return {
      result: { contact_id },
      summary: `Left a note on ${p.name}`,
      show: contactShow(contact_id),
      undo: () => remove(p.thread, entry),
    }
  },

  'schedule.book_session'({ contact_id, service_id, date, time }) {
    const p = person(contact_id)
    const s = service(service_id)
    const taken = p.appts.find((a) => shell().dayISO(a.day) === date && a.time === time && a.status !== 'canceled')
    if (taken) throw new Error(`${p.name} already has ${taken.title} at ${time} that day.`)
    const plansBefore = JSON.stringify(p.plans)
    const a = shell().addBooking(p, s, date, time)
    return {
      result: { booking_id: a.id, contact_id, date, time, covered_by_plan: !!a.plan, due: a.due || 0 },
      summary: `Booked ${p.name} for ${s.name}, ${a.day} at ${time}`,
      show: { page: 'schedule', date, id: contact_id },
      undo: () => {
        remove(p.appts, a)
        p.plans.splice(0, p.plans.length, ...JSON.parse(plansBefore))
      },
    }
  },

  'schedule.cancel_session'({ contact_id, booking_id }) {
    const { p, a } = booking(contact_id, booking_id)
    if (ops().lateWindow(a)) {
      throw new Error(
        `${p.first}'s session on ${a.day} at ${a.time} is inside the 24 hour late cancel window, so canceling it is a late cancel. Use schedule.late_cancel.`,
      )
    }
    const restore = snapshot(p, a)
    const r = ops().cancel(p, a)
    return {
      result: { booking_id, status: 'canceled', credit_used: false, note: r.msg },
      summary: `Canceled ${p.name}'s ${short(a)} on ${a.day} at ${a.time}. ${r.msg}`,
      show: sessionShow(p, a),
      undo: restore,
    }
  },

  'schedule.reschedule'({ contact_id, booking_id, date, time }) {
    const { p, a } = booking(contact_id, booking_id)
    const restore = snapshot(p, a)
    let r
    try {
      r = ops().reschedule(p, a, date, time)
    } catch (e) {
      if (e.no_slot) {
        return {
          result: {
            moved: false,
            no_slot: true,
            message: e.message,
            service_id: e.service_id,
            existing_times: e.slots,
            next_step: `Ask the owner whether to add a ${time} slot. If they say yes, call schedule.add_open_session with service_id ${e.service_id}, date ${date} and time ${time}, then call schedule.reschedule again.`,
          },
        }
      }
      throw e
    }
    return {
      result: { booking_id, moved: true, date, time, credit_used: false, note: r.msg },
      summary: `Moved ${p.name}'s ${short(a)} to ${a.day} at ${time}. No credit used`,
      show: sessionShow(p, a),
      undo: restore,
    }
  },

  'schedule.update_session'({ contact_id, booking_id, date, time, status, reason }) {
    const { p, a } = booking(contact_id, booking_id)
    if (!date && !time && !status) throw new Error('Nothing to change.')
    const restore = snapshot(p, a)
    const r = ops().update(p, a, { date, time, status: status && STATUS[status], why: reason })
    return {
      result: { booking_id, status: a.status, day: a.day, time: a.time, note: r.msg },
      summary: `Updated ${p.name}'s ${short(a)} on ${a.day} at ${a.time}. ${r.msg}`,
      show: sessionShow(p, a),
      undo: restore,
    }
  },

  'schedule.check_in'({ contact_id, booking_id }) {
    const { p, a } = booking(contact_id, booking_id)
    const restore = snapshot(p, a)
    const msg = ops().checkIn(p, a)
    return { result: { booking_id, status: 'checked_in', note: msg }, summary: msg, show: sessionShow(p, a), undo: restore }
  },

  'schedule.check_out'({ contact_id, booking_id }) {
    const { p, a } = booking(contact_id, booking_id)
    const restore = snapshot(p, a)
    const msg = ops().checkOut(p, a)
    return { result: { booking_id, status: 'checked_out', note: msg }, summary: `${p.name}: ${msg}`, show: sessionShow(p, a), undo: restore }
  },

  'schedule.add_open_session'({ service_id, date, time }) {
    const s = service(service_id)
    const title = s.title || s.name
    const o = { id: `os${Date.now()}`, svc: s.id, iso: date, time, title, where: s.where, len: Number((title.match(/(\d+) min/) || [])[1] || 60) }
    db().openSessions.push(o)
    return {
      result: { open_session_id: o.id, date, time },
      summary: `Added an open ${s.name} on ${shell().fd(date)} at ${time}`,
      show: { page: 'schedule', date, id: o.id },
      undo: () => remove(db().openSessions, o),
    }
  },

  'inbox.draft_message'({ contact_id, body }) {
    const p = person(contact_id)
    return {
      result: { contact_id, sent: false },
      summary: `Wrote a draft to ${p.name}. Not sent.`,
      show: { page: 'inbox', id: p.id, text: body, select: '#msgInput' },
    }
  },

  'packages.create_draft'({ service_id, name, price, kind, sessions, expires_days }) {
    const s = service(service_id)
    const item = {
      id: `pk${Date.now()}`,
      svc: s.name,
      name,
      price,
      kind: kind === 'membership' ? 'membership' : 'pack',
      per: kind === 'membership' ? 'month' : null,
      size: sessions || null,
      expires: expires_days || null,
      status: 'Draft',
      online: false,
    }
    db().ITEMS.push(item)
    return {
      result: { package_id: item.id, status: 'Draft' },
      summary: `Drafted ${name} for ${money(price)}${item.per ? '/month' : ''}`,
      show: packageShow(item),
      undo: () => remove(db().ITEMS, item),
    }
  },

  'workflows.create_draft'({ name, description, trigger, steps }) {
    const w = shell().newWorkflow(name, description, trigger, steps)
    return {
      result: { workflow_id: w.id, status: w.status },
      summary: `Drafted the workflow "${name}"`,
      show: workflowShow(w.id),
      undo: () => remove(db().workflows, w),
    }
  },

  'setup.skip_step'({ step_id, reason }) {
    if (!SETUP_STEPS.some((s) => s.id === step_id)) throw new Error(`No setup step ${step_id}.`)
    const DB = db()
    DB.setupSkipped = DB.setupSkipped || {}
    DB.setupSkipped[step_id] = reason
    return {
      result: { step_id, status: 'skipped' },
      summary: `Skipped the setup step "${SETUP_STEPS.find((s) => s.id === step_id).title}"`,
      undo: () => delete DB.setupSkipped[step_id],
    }
  },

  'ui.open'({ screen, contact_id, workflow_id, date }) {
    const M = shell()
    if (contact_id) {
      const p = person(contact_id)
      M.acts.record(p.id)
      return { result: { opened: p.name } }
    }
    if (workflow_id) {
      const w = workflow(workflow_id)
      M.go({ page: 'crm', tab: 'workflows' })
      M.acts.workflow?.(w.id)
      return { result: { opened: w.name } }
    }
    const [page, tab] = (screen || 'home').split('/')
    const id = M.pages[page] ? page : page === 'schedule' && M.pages.sched ? 'sched' : page
    if (!M.pages[id]) throw new Error(`No screen ${screen}.`)
    if (date && M.schedDay) M.schedDay(date)
    M.go({ page: id, tab })
    return { result: { opened: screen } }
  },
}

export const confirm = {
  'schedule.late_cancel'({ contact_id, booking_id }) {
    const { p, a } = booking(contact_id, booking_id)
    if (a.status !== 'booked') throw new Error(`That session is not booked, so it cannot be canceled.`)
    if (!ops().lateWindow(a)) throw new Error(`That session is more than 24 hours away, so it is a normal cancel with no credit used. Use schedule.cancel_session.`)
    const pl = a.plan && p.plans.find((x) => x.id === a.plan)
    const credit = pl && !pl.unlimited
    return {
      title: `Late cancel ${p.name}'s ${short(a)}?`,
      lines: [`${a.day} at ${a.time}`, credit ? `Inside 24 hours. Uses 1 ${pl.service.toLowerCase()} credit.` : 'Inside 24 hours. Nothing is charged.'],
      action: 'Late cancel',
      apply() {
        const restore = snapshot(p, a)
        const r = ops().cancel(p, a)
        return { result: { booking_id, status: 'late_cancel', credit_used: !!credit }, summary: `Late canceled ${p.name}'s ${short(a)}. ${r.msg}`, show: sessionShow(p, a), undo: restore }
      },
    }
  },

  'schedule.mark_no_show'({ contact_id, booking_id }) {
    const { p, a } = booking(contact_id, booking_id)
    if (a.status !== 'booked') throw new Error(`That session is not booked, so it cannot be a no show.`)
    if (!ops().started(a)) throw new Error(`The session has not started yet (${a.day} at ${a.time}). A no show can only be marked after it starts.`)
    const pl = a.plan && p.plans.find((x) => x.id === a.plan)
    const credit = pl && !pl.unlimited
    return {
      title: `Mark ${p.name} as a no show?`,
      lines: [`${short(a)}, ${a.day} at ${a.time}`, credit ? `Uses 1 ${pl.service.toLowerCase()} credit.` : 'Nothing is charged.'],
      action: 'Mark no show',
      apply() {
        const restore = snapshot(p, a)
        const msg = ops().noShow(p, a)
        return { result: { booking_id, status: 'no_show', credit_used: !!credit }, summary: `Marked ${p.name} as a no show. ${msg}`, show: sessionShow(p, a), undo: restore }
      },
    }
  },

  'schedule.remove_session'({ contact_id, booking_id }) {
    const { p, a } = booking(contact_id, booking_id)
    const pl = a.plan && p.plans.find((x) => x.id === a.plan)
    return {
      title: `Remove ${p.name}'s ${short(a)}?`,
      lines: [
        `${a.day} at ${a.time}`,
        'For a booking made by mistake. No history is kept.' + (pl && !pl.unlimited ? ' The credit goes back to left to book.' : ''),
      ],
      action: 'Remove',
      apply() {
        const restore = snapshot(p, a)
        const day = shell().dayISO(a.day)
        const msg = ops().remove(p, a)
        return { result: { booking_id, removed: true }, summary: `Removed ${p.name}'s ${short(a)} on ${a.day}. ${msg}`, show: { page: 'schedule', date: day, id: p.id }, undo: restore }
      },
    }
  },

  'inbox.send_message'({ contact_id, body, channel }) {
    const p = person(contact_id)
    const ch = channel || shell().chanOf(p)
    if (ch === 'Text' && (!p.textOk || !p.phone)) throw new Error(`${p.name} cannot get texts. Use Email.`)
    if (ch === 'Email' && !p.email) throw new Error(`${p.name} has no email on file.`)
    return {
      title: `Send this ${ch.toLowerCase()} to ${p.name}?`,
      lines: [`"${body}"`, ch === 'Text' ? `To ${p.phone}` : `To ${p.email}`],
      action: 'Send',
      apply() {
        const m = { k: 'out', ch, day: 'Today', t: nowLabel(), body, by: 'Milton' }
        p.thread.push(m)
        return {
          result: { contact_id, sent: true, channel: ch },
          summary: `Sent a ${ch.toLowerCase()} to ${p.name}`,
          show: { page: 'inbox', id: p.id, select: '.ithread .msg.r' },
        }
      },
    }
  },

  'payments.refund'({ transaction_id, amount }) {
    const t = db().tx.find((x) => x.id === transaction_id)
    if (!t) throw new Error(`No payment ${transaction_id}. Use payments.list_transactions.`)
    const left = t.paid - (t.refunded || 0)
    if (left <= 0) throw new Error('That payment is already fully refunded.')
    const v = amount ?? left
    if (v > left) throw new Error(`Only ${money(left)} can still be refunded.`)
    const p = shell().person(t.pid)
    return {
      title: `Refund ${money(v)} to ${p ? p.name : 'this customer'}?`,
      lines: [`${t.item}, paid ${money(t.paid)}`, 'The money goes back to the card. This cannot be undone.'],
      action: 'Refund',
      apply() {
        t.refunded = (t.refunded || 0) + v
        t.status = t.refunded >= t.paid ? 'Refunded' : 'Partly refunded'
        return {
          result: { transaction_id, refunded: v },
          summary: `Refunded ${money(v)} to ${p ? p.name : 'a customer'}`,
          show: p ? contactShow(p.id) : { page: 'payments', tab: 'overview', id: transaction_id },
        }
      },
    }
  },

  'contacts.import'() {
    const fresh = SAMPLE_IMPORT.filter((r) => !findSame(r))
    const skip = SAMPLE_IMPORT.length - fresh.length
    return {
      title: `Import ${fresh.length} new people from members.csv?`,
      lines: [
        fresh.map((r) => r.name).join(', '),
        skip ? `${skip} already in the CRM and will be skipped.` : 'Nobody here is in the CRM yet.',
      ],
      action: 'Import',
      apply() {
        const added = fresh.map((r) => newPerson({ ...r, source: 'Imported from members.csv' }))
        const DB = db()
        DB.imports = DB.imports || []
        const run = { file: 'members.csv', added: added.map((p) => p.id) }
        DB.imports.push(run)
        return {
          result: { added: added.map((p) => ({ contact_id: p.id, name: p.name })), skipped: skip },
          summary: `Imported ${added.length} people from members.csv`,
          show: { page: 'crm', tab: 'contacts', ids: added.map((p) => p.id) },
          undo: () => {
            added.forEach((p) => remove(DB.people, p))
            remove(DB.imports, run)
          },
        }
      },
    }
  },

  'packages.publish'({ package_id }) {
    const item = db().ITEMS.find((i) => i.id === package_id)
    if (!item) throw new Error(`No package ${package_id}.`)
    if (item.status !== 'Draft') throw new Error(`${item.name} is already live.`)
    return {
      title: `Publish ${item.name}?`,
      lines: [`${money(item.price)}${item.per ? '/month' : ''} for ${item.svc}`, 'People can buy it as soon as it is live.'],
      action: 'Publish',
      apply() {
        item.status = 'Live'
        item.online = true
        return {
          result: { package_id, status: 'Live' },
          summary: `Published ${item.name}`,
          show: packageShow(item),
          undo: () => Object.assign(item, { status: 'Draft', online: false }),
        }
      },
    }
  },

  'workflows.turn_on'({ workflow_id }) {
    const w = workflow(workflow_id)
    if (w.status === 'Live') throw new Error(`${w.name} is already on.`)
    const before = w.status
    const steps = shell().workflowSummary(w).steps
    return {
      title: `Turn on "${w.name}"?`,
      lines: [
        `Starts when: ${w.trig ? w.trig.k : 'started manually'}`,
        `${steps.length} step${steps.length === 1 ? '' : 's'}: ${steps.map((s) => s.name).join(', ')}`,
        'It starts sending to real people right away.',
      ],
      action: 'Turn on',
      apply() {
        w.status = 'Live'
        return {
          result: { workflow_id, status: 'Live' },
          summary: `Turned on "${w.name}"`,
          show: workflowShow(workflow_id),
          undo: () => (w.status = before),
        }
      },
    }
  },
}

export const readExtra = {
  'setup.get'() {
    return { steps: setupState() }
  },

  /* Logs a request no tool can do and opens the screen where the owner can do it. */
  'milton.cant_do'({ request, screen, contact_id, reason }, asked) {
    const text = (asked || '').trim() || request
    let opened = null
    try {
      write['ui.open']({ screen, contact_id })
      opened = screen
    } catch {
      opened = null
    }
    logGap({ request: text, screen, reason })
    return { logged: true, opened_screen: opened, tell_owner: `Say you can't do that yet and that it can be done on the ${screen} screen, which is now open. Do not give any other reason.` }
  },
}

export { refresh }
