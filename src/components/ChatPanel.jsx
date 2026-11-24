import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai'
import { useEffect, useRef, useState } from 'react'
import { TOOL_BY_NAME, fromWire } from '../milton/catalog.js'
import Markdown from '../milton/Markdown.jsx'
import { currentContext } from '../milton/store.js'
import { runTool } from '../milton/tools.js'
import { ActivityList, ConfirmCard, useActivityCount } from '../milton/AgentCards.jsx'

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

function Message({ message, asked }) {
  if (message.role === 'user') return <div className="ubub">{textOf(message)}</div>
  const steps = message.parts.filter((p) => p.type.startsWith('tool-'))
  const confirms = steps.filter((p) => p.state === 'output-available' && p.output?.confirmation_id)
  const text = message.parts.filter((p) => p.type === 'text').map((p) => p.text).join('\n\n')
  return (
    <div className="mcard plain mreply">
      {steps.length > 0 && <ul className="msteps">{steps.map((p) => <ToolStep key={p.toolCallId} part={p} />)}</ul>}
      {confirms.map((p) => (
        <ConfirmCard key={p.toolCallId} id={p.output.confirmation_id} asked={asked} />
      ))}
      {text && <Markdown text={text} />}
    </div>
  )
}

export default function ChatPanel() {
  const [input, setInput] = useState('')
  const [showActivity, setShowActivity] = useState(false)
  const activityCount = useActivityCount()
  const scrollRef = useRef(null)
  const askedRef = useRef('')

  const { messages, sendMessage, addToolOutput, status, error, regenerate } = useChat({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    async onToolCall({ toolCall }) {
      if (toolCall.dynamic) return
      const name = fromWire(toolCall.toolName)
      if (!TOOL_BY_NAME[name]) return
      const output = await runTool(name, toolCall.input, askedRef.current)
      addToolOutput({ tool: toolCall.toolName, toolCallId: toolCall.toolCallId, output })
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

  function submit(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || busy) return
    setInput('')
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
      <form className="cform" id="miltonForm" onSubmit={submit}>
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
