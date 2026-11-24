import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai'
import { useEffect, useRef, useState } from 'react'
import { TOOL_BY_NAME, fromWire } from '../milton/catalog.js'
import Markdown from '../milton/Markdown.jsx'
import { currentContext } from '../milton/store.js'
import { applyPending, runTool } from '../milton/tools.js'
import { getPending, resolvePending, waitingPending } from '../milton/activity.js'
import { createVoice, voiceSupported } from '../milton/voice.js'
import { ActivityList, ConfirmCard, ViewLink, useActivityCount } from '../milton/AgentCards.jsx'
import { chatCoversScreen, reveal } from '../milton/reveal.js'

const transport = new DefaultChatTransport({
  api: '/api/chat',
  body: () => ({ context: currentContext() }),
})

function ToolStep({ part }) {
  const wire = part.type.slice(5)
  const done = part.state === 'output-available'
  const failed = part.state === 'output-error' || (done && part.output?.error)
  const label =
    wire === 'load_skill'
      ? `Read the ${part.input?.name || ''} notes`.replace('  ', ' ')
      : TOOL_BY_NAME[fromWire(wire)]?.label || fromWire(wire)
  return (
    <li className={`mstep${done ? ' done' : ''}${failed ? ' fail' : ''}`}>
      {label}
      {!done && !failed && <span className="sr-only">, working</span>}
    </li>
  )
}

const textOf = (m) => m.parts.filter((p) => p.type === 'text').map((p) => p.text).join('')

const SAID_YES = /^(yes|yeah|yep|yup|sure|ok(ay)?|confirm(ed)?|do it|go ahead|please do|sounds good)\b/i
const SAID_NO = /^(no|nope|cancel|don'?t|stop|never ?mind|forget it)\b/i

const VOICE_LABEL = {
  starting: 'Starting the mic',
  listening: 'Listening',
  thinking: 'Milton is thinking',
  speaking: 'Milton is speaking. Talk to interrupt.',
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  )
}

function VoiceBar({ state, meterRef, note, onEnd }) {
  return (
    <div className={`vbar ${state}`} role="status" aria-live="polite">
      <span className="vmeter" ref={meterRef} aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="vlabel">{note || VOICE_LABEL[state] || ''}</span>
      <button type="button" className="btn sm quiet" onClick={onEnd}>
        End voice
      </button>
    </div>
  )
}

function Message({ message, asked }) {
  if (message.role === 'user') return <div className="ubub">{textOf(message)}</div>
  const steps = message.parts.filter((p) => p.type.startsWith('tool-'))
  const confirms = steps.filter((p) => p.state === 'output-available' && p.output?.confirmation_id)
  const changes = steps.filter((p) => p.state === 'output-available' && p.output?.show && p.output?.done)
  const text = message.parts.filter((p) => p.type === 'text').map((p) => p.text).join('\n\n')
  return (
    <div className="mcard plain mreply">
      {steps.length > 0 && <ul className="msteps">{steps.map((p) => <ToolStep key={p.toolCallId} part={p} />)}</ul>}
      {confirms.map((p) => (
        <ConfirmCard key={p.toolCallId} id={p.output.confirmation_id} asked={asked} />
      ))}
      {text && <Markdown text={text} />}
      {changes.length > 0 && (
        <ul className="mviews">
          {changes.map((p) => (
            <li key={p.toolCallId}>
              <ViewLink show={p.output.show}>{`View: ${p.output.done}`}</ViewLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function ChatPanel() {
  const [input, setInput] = useState('')
  const [showActivity, setShowActivity] = useState(false)
  const activityCount = useActivityCount()
  const scrollRef = useRef(null)
  const askedRef = useRef('')
  const revealedRef = useRef(false)

  const { messages, sendMessage, addToolOutput, status, error, regenerate } = useChat({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    async onToolCall({ toolCall }) {
      if (toolCall.dynamic) return
      const name = fromWire(toolCall.toolName)
      if (!TOOL_BY_NAME[name]) return
      const output = await runTool(name, toolCall.input, askedRef.current)
      addToolOutput({ tool: toolCall.toolName, toolCallId: toolCall.toolCallId, output })
      if (output?.show && !chatCoversScreen()) {
        reveal(output.show, { replace: revealedRef.current })
        revealedRef.current = true
      }
    },
  })

  const busy = status === 'submitted' || status === 'streaming'
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  askedRef.current = lastUser ? textOf(lastUser) : ''

  useEffect(() => {
    const ask = (e) => sendMessage({ text: e.detail })
    window.addEventListener('milton:ask', ask)
    return () => window.removeEventListener('milton:ask', ask)
  }, [sendMessage])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, status])

  const [voiceState, setVoiceState] = useState('off')
  const [voiceNote, setVoiceNote] = useState('')
  const voiceRef = useRef(null)
  const meterRef = useRef(null)
  const spokenRef = useRef(null)
  const canVoice = typeof window !== 'undefined' && voiceSupported()

  /* A spoken "yes" or "no" answers a waiting confirm card the same way its buttons do. */
  function answerConfirm(text) {
    const waiting = waitingPending()
    if (waiting.length !== 1) return false
    const p = waiting[0]
    const yes = SAID_YES.test(text.trim())
    const no = SAID_NO.test(text.trim())
    if (!yes && !no) return false
    if (no) {
      resolvePending(p.id, 'canceled', 'Canceled')
      voiceRef.current.say('Okay, canceled. Nothing changed.')
      return true
    }
    const values = Object.fromEntries((p.fields || []).map((f) => [f.name, f.value ?? '']))
    if ((p.fields || []).some((f) => f.required && !String(values[f.name] ?? '').trim())) {
      voiceRef.current.say('That one needs a detail filled in on the card first.')
      return true
    }
    const out = applyPending(p.id, askedRef.current, values)
    if (out?.show && !chatCoversScreen()) reveal(out.show)
    const after = getPending(p.id)
    voiceRef.current.say(after?.state === 'done' ? `Done. ${after.result}.` : `I could not do that. ${after?.result || ''}`)
    return true
  }

  function onHeard(text) {
    if (answerConfirm(text)) return
    revealedRef.current = false
    document.getElementById('chat')?.classList.add('up')
    sendMessage({ text })
  }
  const onHeardRef = useRef(onHeard)
  onHeardRef.current = onHeard

  async function startVoice() {
    if (!voiceRef.current) {
      voiceRef.current = createVoice({
        onState: (s) => {
          setVoiceState(s)
          if (s === 'listening') setVoiceNote('')
        },
        onTranscript: (t) => onHeardRef.current(t),
        onError: (m) => setVoiceNote(m),
        onLevel: (rms) => {
          const el = meterRef.current
          if (el) el.style.setProperty('--lvl', Math.min(1, rms * 14).toFixed(3))
        },
      })
    }
    spokenRef.current = messages[messages.length - 1]?.id ?? null
    setVoiceNote('')
    await voiceRef.current.start()
  }

  function endVoice() {
    voiceRef.current?.stop()
  }

  useEffect(() => () => voiceRef.current?.stop(), [])

  /* Speak each finished reply, then hand the mic back. */
  useEffect(() => {
    const v = voiceRef.current
    if (!v || v.state === 'off') return
    if (status === 'submitted' || status === 'streaming') {
      if (v.state !== 'thinking') v.hold()
      return
    }
    const last = messages[messages.length - 1]
    if (error && spokenRef.current !== 'error') {
      spokenRef.current = 'error'
      v.say('Sorry, I could not answer that. Try again.')
      return
    }
    if (status !== 'ready' || !last || last.role !== 'assistant' || spokenRef.current === last.id) return
    if (lastAssistantMessageIsCompleteWithToolCalls({ messages })) return
    spokenRef.current = last.id
    let reply = last.parts.filter((p) => p.type === 'text').map((p) => p.text).join('\n\n')
    if (waitingPending().length === 1) reply = `${reply}\n\nSay yes to confirm, or no to cancel.`
    v.say(reply || 'Done.')
  }, [messages, status, error])

  function submit(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || busy) return
    setInput('')
    revealedRef.current = false
    document.getElementById('chat')?.classList.add('up')
    sendMessage({ text })
  }

  return (
    <aside className="chat" id="chat" aria-label="Milton chat">
      <div className="chead">
        <span className="nm">
          <img className="mav" src="/assets/milton.png" alt="" />
          Milton
        </span>
        <button
          className="btn sm quiet chead-act"
          type="button"
          aria-expanded={showActivity}
          onClick={() => setShowActivity((v) => !v)}
        >
          Activity{activityCount ? ` ${activityCount}` : ''}
        </button>
        <button className="btn sm quiet" data-act="chatup" id="chatTog" type="button">
          Open
        </button>
      </div>
      {showActivity && <ActivityList onClose={() => setShowActivity(false)} />}
      <div className="cbody" ref={scrollRef} hidden={showActivity}>
        {/* The screen brief. Platform modules write into this element directly. */}
        <div className="cstack" id="chatBody" />
        <div className="cstack" aria-live="polite">
          {messages.map((m) => (
            <Message key={m.id} message={m} asked={askedRef.current} />
          ))}
          {status === 'submitted' && <div className="mthink">Milton is looking</div>}
          {error && (
            <div className="mcard plain merr" role="alert">
              Milton could not answer that.{' '}
              <button type="button" className="mlink" onClick={() => regenerate()}>
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="sugg" id="sugg" />
      {voiceState !== 'off' && <VoiceBar state={voiceState} meterRef={meterRef} note={voiceNote} onEnd={endVoice} />}
      {voiceState === 'off' && voiceNote && (
        <p className="vnote" role="alert">
          {voiceNote}
        </p>
      )}
      <form className="cform" id="miltonForm" onSubmit={submit}>
        {canVoice && (
          <button
            type="button"
            className={`vmic${voiceState !== 'off' ? ' on' : ''}`}
            aria-pressed={voiceState !== 'off'}
            aria-label={voiceState !== 'off' ? 'End voice conversation' : 'Talk to Milton'}
            onClick={() => (voiceState === 'off' ? startVoice() : endVoice())}
          >
            <MicIcon />
          </button>
        )}
        <input
          id="chatInput"
          type="text"
          autoComplete="off"
          aria-label="Message Milton"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" aria-label="Send to Milton" disabled={busy}>
          {'\u2191'}
        </button>
      </form>
    </aside>
  )
}
