import { db } from './store.js'

/*
 * The setup record. Every status is worked out from real data in the gym
 * store. The only thing stored is which steps the owner chose to skip.
 */

const live = (x) => !x.status || x.status === 'Live'
const welcomeFlow = (w) => /welcome/i.test(w.name)
const waiverFlow = (w) => /waiver/i.test(w.name)

export const SETUP_STEPS = [
  {
    id: 'gym_profile',
    title: 'Fill in your gym profile',
    screen: 'settings',
    check: (DB) => (DB.GYM.name && DB.GYM.num && DB.GYM.site && DB.GYM.tz ? 'done' : DB.GYM.name ? 'in_progress' : 'not_started'),
  },
  {
    id: 'services',
    title: 'Add what you deliver',
    screen: 'services',
    check: (DB) => (DB.SERVICES.length ? 'done' : 'not_started'),
  },
  {
    id: 'first_package',
    title: 'Sell your first package',
    screen: 'services',
    check: (DB) => {
      const packs = DB.ITEMS.filter((i) => i.kind !== 'product')
      if (packs.some(live)) return 'done'
      return packs.length ? 'in_progress' : 'not_started'
    },
  },
  {
    id: 'schedule',
    title: 'Put sessions on the schedule',
    screen: 'schedule',
    check: (DB) => (DB.SERVICES.some((s) => s.times?.length) || DB.openSessions?.length ? 'done' : 'not_started'),
  },
  {
    id: 'payouts',
    title: 'Connect where payouts go',
    screen: 'payments',
    check: (DB) => (DB.GYM.bank ? 'done' : 'not_started'),
  },
  {
    id: 'team',
    title: 'Add your team',
    screen: 'team',
    check: (DB) => (DB.TEAM.length > 1 ? 'done' : 'not_started'),
  },
  {
    id: 'import_contacts',
    title: 'Import your member list',
    screen: 'crm',
    check: (DB) => (DB.imports?.length ? 'done' : 'not_started'),
  },
  {
    id: 'welcome_workflow',
    title: 'Turn on a welcome text for new members',
    screen: 'crm/workflows',
    check: (DB) => {
      const w = DB.workflows.filter(welcomeFlow)
      if (w.some((x) => x.status === 'Live')) return 'done'
      return w.length ? 'in_progress' : 'not_started'
    },
  },
  {
    id: 'waivers',
    title: 'Ask new people to sign a waiver',
    screen: 'crm/workflows',
    check: (DB) => {
      const w = DB.workflows.filter(waiverFlow)
      if (w.some((x) => x.status === 'Live')) return 'done'
      return w.length ? 'in_progress' : 'not_started'
    },
  },
  {
    id: 'first_announcement',
    title: 'Send your first announcement',
    screen: 'inbox',
    check: (DB) => (DB.sends?.some((s) => /broadcast/i.test(s.kind || '')) ? 'done' : 'not_started'),
  },
]

export function setupState() {
  const DB = db()
  if (!DB) return []
  const skipped = DB.setupSkipped || {}
  return SETUP_STEPS.map((s) => {
    const status = s.check(DB)
    return {
      step_id: s.id,
      title: s.title,
      screen: s.screen,
      status: status !== 'done' && skipped[s.id] ? 'skipped' : status,
      ...(skipped[s.id] && status !== 'done' ? { skipped_because: skipped[s.id] } : {}),
    }
  })
}
