import { useState, useSyncExternalStore } from 'react'
import { getActivity, getGaps, getPending, getVersion, resolvePending, subscribe, undoEntry } from './activity.js'
import { applyPending } from './tools.js'
import { chatCoversScreen, closeChat, reveal } from './reveal.js'

const useActivityVersion = () => useSyncExternalStore(subscribe, getVersion)

/* Opens a changed record. On a narrow screen it first closes the chat that covers it. */
export function ViewLink({ show, children = 'View', className = 'mview' }) {
  return (
    <button
      type="button"
      className={`mlink ${className}`}
      onClick={() => {
        const covered = chatCoversScreen()
        if (covered) closeChat()
        reveal(show)
      }}
    >
      {children}
    </button>
  )
}

/* The same fields the side panel asks for, filled in from what the owner said. */
function ConfirmFields({ id, fields, values, setValues }) {
  return (
    <div className="mconfirm-fields">
      {fields.map((f) => {
        const fid = `mc-${id}-${f.name}`
        const set = (v) => setValues({ ...values, [f.name]: v })
        return (
          <div key={f.name} className="mconfirm-field">
            <label htmlFor={fid}>
              {f.label}
              {f.required ? '' : ' (optional)'}
            </label>
            {f.options ? (
              <select id={fid} value={values[f.name] ?? ''} onChange={(e) => set(e.target.value)}>
                {!values[f.name] && <option value="">Choose one</option>}
                {f.options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            ) : (
              <input
                id={fid}
                type={f.type === 'number' ? 'number' : 'text'}
                inputMode={f.type === 'number' ? 'decimal' : undefined}
                value={values[f.name] ?? ''}
                onChange={(e) => set(e.target.value)}
              />
            )}
            {f.required && !String(values[f.name] ?? '').trim() && <span className="mconfirm-need">Milton needs this from you.</span>}
          </div>
        )
      })}
    </div>
  )
}

export function ConfirmCard({ id, asked }) {
  useActivityVersion()
  const p = getPending(id)
  const [values, setValues] = useState(() => Object.fromEntries((p?.fields || []).map((f) => [f.name, f.value ?? ''])))
  if (!p) return null
  const fields = p.fields || []
  const missing = fields.some((f) => f.required && !String(values[f.name] ?? '').trim())
  return (
    <div className={`mconfirm ${p.state}`} role="group" aria-label={p.title}>
      <p className="mconfirm-title">{p.title}</p>
      {p.lines.map((l) => (
        <p key={l} className="mconfirm-line">
          {l}
        </p>
      ))}
      {p.state === 'waiting' && fields.length > 0 && <ConfirmFields id={id} fields={fields} values={values} setValues={setValues} />}
      {p.state === 'waiting' ? (
        <div className="mconfirm-acts">
          <button
            type="button"
            className="btn sm primary"
            disabled={missing}
            onClick={() => {
              const out = applyPending(id, asked, values)
              if (out?.show && !chatCoversScreen()) reveal(out.show)
            }}
          >
            {p.action || 'Confirm'}
          </button>
          <button type="button" className="btn sm quiet" onClick={() => resolvePending(id, 'canceled', 'Canceled')}>
            Cancel
          </button>
        </div>
      ) : (
        <p className="mconfirm-result">
          {p.state === 'done' ? `Done. ${p.result}.` : p.state === 'canceled' ? 'Canceled. Nothing changed.' : `Could not do it. ${p.result}`}
          {p.state === 'done' && p.show && <ViewLink show={p.show} />}
        </p>
      )}
    </div>
  )
}

export function ActivityList({ onClose }) {
  useActivityVersion()
  const entries = getActivity()
  const gaps = getGaps()
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
      {gaps.length > 0 && (
        <>
          <h3 className="mactivity-sub">Could not do</h3>
          <ul>
            {gaps.map((g) => (
              <li key={g.id}>
                <div className="mact-main">
                  <span className="mact-sum">{`"${g.request}"`}</span>
                  <span className="mact-meta">{`${g.at} · Opened ${g.screen}`}</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

export function useActivityCount() {
  useActivityVersion()
  return getActivity().filter((e) => !e.undone).length
}
