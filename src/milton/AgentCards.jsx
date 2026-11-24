import { useSyncExternalStore } from 'react'
import { getActivity, getPending, getVersion, resolvePending, subscribe, undoEntry } from './activity.js'
import { applyPending } from './tools.js'

const useActivityVersion = () => useSyncExternalStore(subscribe, getVersion)

export function ConfirmCard({ id, asked }) {
  useActivityVersion()
  const p = getPending(id)
  if (!p) return null
  return (
    <div className={`mconfirm ${p.state}`} role="group" aria-label={p.title}>
      <p className="mconfirm-title">{p.title}</p>
      {p.lines.map((l) => (
        <p key={l} className="mconfirm-line">
          {l}
        </p>
      ))}
      {p.state === 'waiting' ? (
        <div className="mconfirm-acts">
          <button type="button" className="btn sm primary" onClick={() => applyPending(id, asked)}>
            {p.action || 'Confirm'}
          </button>
          <button type="button" className="btn sm quiet" onClick={() => resolvePending(id, 'canceled', 'Canceled')}>
            Cancel
          </button>
        </div>
      ) : (
        <p className="mconfirm-result">{p.state === 'done' ? `Done. ${p.result}.` : p.state === 'canceled' ? 'Canceled. Nothing changed.' : `Could not do it. ${p.result}`}</p>
      )}
    </div>
  )
}

export function ActivityList({ onClose }) {
  useActivityVersion()
  const entries = getActivity()
  return (
    <section className="mactivity" aria-label="What Milton changed">
      <div className="mactivity-head">
        <h2>Activity</h2>
        <button type="button" className="btn sm quiet" onClick={onClose}>
          Close
        </button>
      </div>
      {entries.length === 0 ? (
        <p className="mactivity-empty">Nothing yet. Every change Milton makes shows up here, with a way to undo it.</p>
      ) : (
        <ul>
          {entries.map((e) => (
            <li key={e.id} className={e.undone ? 'undone' : ''}>
              <div className="mact-main">
                <span className="mact-sum">{e.summary}</span>
                <span className="mact-meta">
                  {e.at}
                  {e.asked ? ` · You asked: "${e.asked}"` : ''}
                </span>
              </div>
              {e.undone ? (
                <span className="mact-tag">Undone</span>
              ) : e.undo ? (
                <button type="button" className="mlink" onClick={() => undoEntry(e.id)}>
                  Undo
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function useActivityCount() {
  useActivityVersion()
  return getActivity().filter((e) => !e.undone).length
}
