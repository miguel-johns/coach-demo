import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
} from 'ai'
import { z } from 'zod'
import { TOOLS, toWire } from '../src/milton/catalog.js'
import { buildInstructions } from '../server/prompt.js'
import { loadSkills } from '../server/skills.js'

export const maxDuration = 60

// gpt-5-mini runs on the AI Gateway free tier. Set MILTON_MODEL=anthropic/claude-sonnet-5.5 once the team has credits.
const MODEL = process.env.MILTON_MODEL || 'openai/gpt-5-mini'
const MAX_STEPS = 15
const MAX_MESSAGES = 60
const MAX_BODY_BYTES = 400_000

/* Tool calls in the newest assistant turn, so the cap holds across client round trips. */
function stepsThisTurn(messages) {
  const last = messages[messages.length - 1]
  if (!last || last.role !== 'assistant') return 0
  return last.parts.filter((p) => p.type === 'step-start').length
}

function loadedSkills(messages) {
  const names = new Set()
  messages.forEach((m) =>
    m.parts?.forEach((p) => {
      if (p.type === 'tool-load_skill' && p.state === 'output-available' && p.input?.name) names.add(p.input.name)
    }),
  )
  return [...names]
}

function buildTools(skills, loaded) {
  const unlocked = new Set(skills.filter((s) => loaded.includes(s.name)).flatMap((s) => s.tools))
  const tools = {
    load_skill: {
      description: 'Load the instructions for one area of the gym before working in it.',
      inputSchema: z.object({ name: z.enum(skills.map((s) => s.name)) }),
      execute: async ({ name }) => {
        const s = skills.find((x) => x.name === name)
        return { skill: s.name, instructions: s.body }
      },
    },
  }
  /* Read tools are always on. Write and confirm tools only after a skill that lists them is loaded. */
  TOOLS.filter((t) => t.tier === 'read' || t.tier === 'always' || unlocked.has(t.name)).forEach((t) => {
    tools[toWire(t.name)] = { description: t.description, inputSchema: t.input }
  })
  return tools
}

export async function POST(req) {
  const raw = await req.text()
  if (raw.length > MAX_BODY_BYTES) return new Response('Conversation is too long. Start a new one.', { status: 413 })

  let body
  try {
    body = JSON.parse(raw)
  } catch {
    return new Response('Bad request', { status: 400 })
  }
  const messages = Array.isArray(body.messages) ? body.messages.slice(-MAX_MESSAGES) : []
  if (!messages.length) return new Response('No messages', { status: 400 })

  const skills = loadSkills()
  const loaded = loadedSkills(messages)
  const tools = buildTools(skills, loaded)
  const remaining = MAX_STEPS - stepsThisTurn(messages)

  const result = streamText({
    model: MODEL,
    instructions: buildInstructions({
      context: body.context,
      skills,
      loaded,
      canWrite: TOOLS.some((t) => t.tier !== 'read'),
    }),
    messages: await convertToModelMessages(messages),
    tools,
    toolChoice: remaining > 0 ? 'auto' : 'none',
    stopWhen: isStepCount(Math.max(1, remaining)),
    onError: ({ error }) => console.error('[api/chat]', error?.message || error),
  })

  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) })
}
