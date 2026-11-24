/*
 * The gym store is the legacy global DB. Screens read it through M; Milton's
 * tools read and write the same objects, then call refresh() so every screen
 * redraws from the store.
 */

export const db = () => window.DB
export const shell = () => window.M

export function refresh() {
  shell()?.render()
}

export function currentContext() {
  const DB = db()
  const M = shell()
  if (!DB || !M) return null
  const page = M.pages[M.route.page] || M.pages.home
  return {
    gym: { name: DB.GYM.name, phone: DB.GYM.num, site: DB.GYM.site, timezone: DB.GYM.tz },
    today: DB.TODAY,
    now: M.toMin ? formatMinutes(DB.NOW) : null,
    you: M.you(),
    team: DB.TEAM.map((t) => ({ id: t.id, name: t.name, role: t.role })),
    services: DB.SERVICES.map((s) => ({ id: s.id, name: s.name, where: s.where })),
    screen: { page: M.route.page, tab: M.route.tab || null, title: page.title },
  }
}

function formatMinutes(n) {
  const h = Math.floor(n / 60) % 24
  const m = n % 60
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
}
