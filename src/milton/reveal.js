import { shell } from './store.js'

/*
 * Opens the screen a Milton change landed on and briefly highlights the record.
 * A show target is { page, tab?, id?, ids?, date?, text?, select? }.
 */

/* Below this width the chat floats over the main area. */
const COVER_QUERY = '(max-width:1100px)'

export function chatCoversScreen() {
  const chat = document.getElementById('chat')
  return window.matchMedia(COVER_QUERY).matches && !!chat?.classList.contains('up')
}

export function closeChat() {
  document.getElementById('chat')?.classList.remove('up')
  const tog = document.getElementById('chatTog')
  if (tog) tog.textContent = 'Open'
}

function navigate(M, show) {
  if (show.page === 'inbox' && show.id) {
    M.openThread(show.id, show.text)
    return
  }
  if (show.page === 'crm' && show.tab === 'workflows' && show.id) {
    M.go({ page: 'crm', tab: 'workflows' })
    M.acts.workflow?.(show.id)
    return
  }
  if (show.page === 'crm' && show.id) {
    M.acts.record(show.id)
    return
  }
  if (show.date && M.schedDay) M.schedDay(show.date)
  M.go({ page: show.page, tab: show.tab })
  if (show.session && M.sess?.open && M.sess.find(show.session.join('|'))) M.sess.open(...show.session)
}

const ROW = 'tr,.row,li,.msg,.card'

function targets(show) {
  const app = document.getElementById('app')
  if (!app) return []
  if (show.select) {
    const hit = [...app.querySelectorAll(show.select)]
    if (hit.length) return [hit[hit.length - 1]]
  }
  const ids = show.ids || (show.id ? [show.id] : [])
  const rows = ids
    .map((id) => app.querySelector(`[data-id="${CSS.escape(id)}"]`))
    .filter(Boolean)
    .map((el) => el.closest(ROW) || el)
  if (rows.length) return rows
  const card = app.querySelector('.card') || app.firstElementChild
  return card ? [card] : []
}

function flash(show) {
  const els = targets(show)
  if (!els.length) return
  els[0].scrollIntoView({ block: 'center', behavior: 'smooth' })
  els.forEach((el) => {
    el.classList.remove('mflash')
    void el.offsetWidth
    el.classList.add('mflash')
    setTimeout(() => el.classList.remove('mflash'), 2600)
  })
}

/*
 * replace: true keeps the back trail pointing at where the owner was before
 * Milton started, so several changes in one reply do not stack up back steps.
 */
export function reveal(show, { replace = false } = {}) {
  const M = shell()
  if (!show || !M) return
  const before = M._back
  if (replace) M._back = true
  try {
    navigate(M, show)
  } finally {
    M._back = before
  }
  requestAnimationFrame(() => requestAnimationFrame(() => flash(show)))
}
