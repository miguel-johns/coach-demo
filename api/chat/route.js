import { streamText } from "ai"
import { anthropic } from "@ai-sdk/anthropic"

export const maxDuration = 60

const SYSTEM_PROMPT = `You are Milton, an AI coaching assistant for nutrition and fitness coaches. You help coaches manage their clients by providing insights about client data, suggesting interventions, and helping with meal planning and program adjustments.

Key behaviors:
- Be concise and actionable in your responses
- Reference specific client data when available
- Suggest evidence-based interventions
- Help identify patterns in client behavior
- Support coaches in making data-driven decisions

When a coach asks about a specific client, provide relevant insights about their:
- Logging consistency and trends
- Nutrition metrics (calories, protein, etc.)
- Weight progress and goal trajectory
- Areas needing attention

Keep responses brief but helpful - coaches are busy and need quick, actionable insights.`

export async function POST(req) {
  const { messages, clientContext } = await req.json()

  // Build context-aware system prompt
  let systemPrompt = SYSTEM_PROMPT
  if (clientContext) {
    systemPrompt += `\n\nCurrent client context:\n${JSON.stringify(clientContext, null, 2)}`
  }

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.type === "user" ? "user" : "assistant",
      content: m.text || m.title + "\n\n" + m.text,
    })),
    abortSignal: req.signal,
  })

  return result.toTextStreamResponse()
}
