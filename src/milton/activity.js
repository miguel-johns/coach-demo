/*
 * What Milton changed (Activity) and what is waiting for the owner's tap
 * (pending confirmations). Both live in the browser next to the gym store.
 */

let version = 0
let entries = []
const pending = new Map()
const listeners = new Set()

function emit() {
  version++
  listeners.forEach((fn) => fn())
}

export const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export const getVersion = () => version

export const getActivity = () => entries

function clock() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export function record({ asked, tool, summary, undo }) {
  const entry = { id: `act${Date.now()}${Math.floor(Math.random() * 1000)}`, at: clock(), asked, tool, summary, undo, undone: false }
  entries = [entry, ...entries]
  emit()
  return entry
}

/* Requests Milton could not do, shown at the bottom of Activity. */
let gaps = []
export const getGaps = () => gaps

export function logGap({ request, screen, reason }) {
  gaps = [{ id: `gap${Date.now()}${Math.floor(Math.random() * 1000)}`, at: clock(), request, screen, reason }, ...gaps]
  emit()
}

export function undoEntry(id) {
  const e = entries.find((x) => x.id === id)
  if (!e || !e.undo || e.undone) return false
  e.undo()
  e.undone = true
  entries = [...entries]
  emit()
  return true
}

export function addPending(plan) {
  const id = `cf${Date.now()}${Math.floor(Math.random() * 1000)}`
  pending.set(id, { ...plan, id, state: 'waiting' })
  emit()
  return id
}

export const getPending = (id) => pending.get(id)
export const waitingPending = () => [...pending.values()].filter((p) => p.state === 'waiting')

export function resolvePending(id, state, result, extra) {
  const p = pending.get(id)
  if (!p) return
  pending.set(id, { ...p, ...extra, state, result })
  emit()
}
