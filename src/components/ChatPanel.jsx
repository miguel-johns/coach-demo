import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai'
import { useEffect, useRef, useState } from 'react'
import { TOOL_BY_NAME, fromWire } from '../milton/catalog.js'
import Markdown from '../milton/Markdown.jsx'
import { currentContext } from '../milton/store.js'
import { runTool } from '../milton/tools.js'

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

function Message({ message }) {
  if (message.role === 'user') {
    const text = message.parts.filter((p) => p.type === 'text').map((p) => p.text).join('')
    return <div className="ubub">{text}</div>
  }
  const steps = message.parts.filter((p) => p.type.startsWith('tool-'))
  const text = message.parts.filter((p) => p.type === 'text').map((p) => p.text).join('\n\n')
  return (
    <div className="mcard plain mreply">
      {steps.length > 0 && <ul className="msteps">{steps.map((p) => <ToolStep key={p.toolCallId} part={p} />)}</ul>}
      {text && <Markdown text={text} />}
    </div>
  )
}

export default function ChatPanel() {
  const [input, setInput] = useState('')
  const scrollRef = useRef(null)

  const { messages, sendMessage, addToolOutput, status, error, regenerate } = useChat({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    async onToolCall({ toolCall }) {
      if (toolCall.dynamic) return
      const name = fromWire(toolCall.toolName)
      if (!TOOL_BY_NAME[name]) return
      const output = await runTool(name, toolCall.input)
      addToolOutput({ tool: toolCall.toolName, toolCallId: toolCall.toolCallId, output })
    },
  })

  const busy = status === 'submitted' || status === 'streaming'

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
        <button className="btn sm quiet" data-act="chatup" id="chatTog" type="button">
          Open
        </button>
      </div>
      <div className="cbody" ref={scrollRef}>
        {/* The screen brief. Platform modules write into this element directly. */}
        <div className="cstack" id="chatBody" />
        <div className="cstack" aria-live="polite">
          {messages.map((m) => (
            <Message key={m.id} message={m} />
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
