import { generateText } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"

// Demo client dataset - hardcoded for reliability
const demoClients = [
  {
    name: "Sarah Chen",
    goal: "Lose 15 lbs for wedding in 3 months",
    status: "at-risk",
    issue: "Missed logging for 4 days straight",
    action: "Send a supportive check-in message",
    loggingStreak: 0,
    protein: "95g (target: 120g)",
    weight: "up 1.2 lbs this week",
    week: 6
  },
  {
    name: "Marcus Johnson",
    goal: "Build muscle, gain 10 lbs lean mass",
    status: "highly-engaged",
    win: "Hit protein goal 7 days straight",
    action: "Celebrate streak and suggest higher calorie target",
    loggingStreak: 14,
    protein: "185g (target: 180g)",
    weight: "up 0.8 lbs (on track)",
    week: 8
  },
  {
    name: "Emily Rodriguez",
    goal: "Improve energy and relationship with food",
    status: "moderate",
    issue: "Calories under 1200 on weekdays, spikes on weekends",
    action: "Schedule call about sustainable eating",
    loggingStreak: 5,
    protein: "68g (target: 100g)",
    weight: "fluctuating +/- 2 lbs",
    week: 4
  },
  {
    name: "David Park",
    goal: "Drop from 22% to 15% body fat",
    status: "highly-engaged",
    issue: "Weight plateau for 2 weeks despite good adherence",
    win: "Perfect logging for 21 days",
    action: "Consider macro adjustment or diet break",
    loggingStreak: 21,
    protein: "165g (target: 160g)",
    weight: "flat for 14 days",
    week: 10
  },
  {
    name: "Rachel Kim",
    goal: "Post-pregnancy fitness and strength",
    status: "new-client",
    issue: "Struggling to find time to log with newborn",
    win: "Completed first full week of workouts postpartum",
    action: "Send encouragement and offer quick-log templates",
    loggingStreak: 2,
    protein: "85g (target: 110g)",
    weight: "down 0.5 lbs (healthy pace)",
    week: 2
  }
]

function buildSystemPrompt() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  
  const clientData = demoClients.map(c => `
**${c.name}** (Week ${c.week}, ${c.status})
- Goal: ${c.goal}
- ${c.issue ? `Issue: ${c.issue}` : `Win: ${c.win}`}
- Logging streak: ${c.loggingStreak} days
- Protein: ${c.protein}
- Weight: ${c.weight}
- Recommended: ${c.action}`).join('\n')

  return `You are Milton, an AI coaching copilot for nutrition and fitness coaches. You have real-time access to all client data shown below.

## Your Personality
- Warm but efficient — like a trusted colleague
- Action-oriented — always suggest a clear next step
- Concise — keep responses to 2-4 sentences unless asked for more detail

## Response Rules
- ONLY reference the 5 clients listed below — never invent clients or data
- Use specific names and numbers from the data
- When asked "who needs attention": prioritize Sarah (at-risk) and Emily (moderate concern)
- When asked to write a message: write it ready to copy/paste, casual and encouraging tone
- When summarizing: use bullet points
- When asked "who is doing well": highlight Marcus and David

## Current Client Roster (5 clients):
${clientData}

## Today's Context
- Date: ${today}
- Clients needing attention: Sarah Chen (at-risk), Emily Rodriguez (moderate)
- Clients doing well: Marcus Johnson, David Park
- New client: Rachel Kim (week 2)

Remember: Be specific, be brief, be helpful.`
}

// Vercel Serverless Function handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { messages } = req.body
    
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('[v0] ANTHROPIC_API_KEY not set')
      return res.status(500).json({ error: 'API key not configured' })
    }

    const anthropic = createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const systemPrompt = buildSystemPrompt()

    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.type === "user" ? "user" : "assistant",
        content: m.text || "",
      })),
    })

    res.status(200).json({ text })
  } catch (error) {
    console.error('[v0] Chat API error:', error.message, error.stack)
    res.status(500).json({ error: 'Failed to generate response', details: error.message })
  }
}
