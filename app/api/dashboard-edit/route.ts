import { generateText, Output } from "ai"
import { z } from "zod"

const configSchema = z.object({
  headerBg: z.string().nullable(),
  headerTextColor: z.string().nullable(),
  bodyBg: z.string().nullable(),
  accentColor: z.string().nullable(),
  cardDarkBg: z.string().nullable(),
  titleSize: z.number().nullable(),
  showCoachNote: z.boolean().nullable(),
  showVideoLinks: z.boolean().nullable(),
  showRestTimers: z.boolean().nullable(),
  showTempoChips: z.boolean().nullable(),
  showProgressBar: z.boolean().nullable(),
  showSchedule: z.boolean().nullable(),
  showProtocolCard: z.boolean().nullable(),
  showChallengeCard: z.boolean().nullable(),
  showActionButton: z.boolean().nullable(),
  showWeekGlance: z.boolean().nullable(),
  showCaloriesCard: z.boolean().nullable(),
  showMacrosCard: z.boolean().nullable(),
  showFiberWater: z.boolean().nullable(),
  showFoodLog: z.boolean().nullable(),
  showAiInsights: z.boolean().nullable(),
  showHeroImage: z.boolean().nullable(),
  showAiReasoning: z.boolean().nullable(),
  showHeroStats: z.boolean().nullable(),
  showAiSummary: z.boolean().nullable(),
  coachNote: z.string().nullable(),
})

export async function POST(req: Request) {
  try {
    const { message, currentConfig, templateId } = await req.json()

    const result = await generateText({
      model: "openai/gpt-4o-mini",
      system: `You are a dashboard configuration assistant. Given a user's natural language request to modify a dashboard, return ONLY the config properties that should change.

Available config properties and their types:
- headerBg: string (hex color like "#1a1a1a" or "#ffffff")
- headerTextColor: string (hex color)
- bodyBg: string (hex color for the body/main area background)
- accentColor: string (hex color for accent/highlight elements)
- cardDarkBg: string (hex color for dark cards)
- titleSize: number (font size in pixels, typically 24-36)
- showCoachNote: boolean (show/hide coach notes section)
- showVideoLinks: boolean (show/hide video links on exercises)
- showRestTimers: boolean (show/hide rest timer chips)
- showTempoChips: boolean (show/hide tempo indicators)
- showProgressBar: boolean (show/hide progress bar)
- showSchedule: boolean (show/hide schedule section)
- showProtocolCard: boolean (show/hide protocol progress card)
- showChallengeCard: boolean (show/hide challenge card)
- showActionButton: boolean (show/hide action button)
- showWeekGlance: boolean (show/hide week at a glance)
- showCaloriesCard: boolean (show/hide calories card)
- showMacrosCard: boolean (show/hide macros card)
- showFiberWater: boolean (show/hide fiber/water tracking)
- showFoodLog: boolean (show/hide food log)
- showAiInsights: boolean (show/hide AI insights)
- showHeroImage: boolean (show/hide hero image)
- showAiReasoning: boolean (show/hide AI reasoning)
- showHeroStats: boolean (show/hide hero stats)
- showAiSummary: boolean (show/hide AI summary)
- coachNote: string (the text of the coach note)

Color interpretation:
- "dark theme" = headerBg: "#1a1a1a", headerTextColor: "#ffffff"
- "light theme" = headerBg: "#ffffff", headerTextColor: "#111111"
- "blue" = "#3b82f6", "red" = "#ef4444", "green" = "#22c55e", "purple" = "#8b5cf6", "orange" = "#f97316", "teal" = "#14b8a6", "pink" = "#ec4899", "navy" = "#1e3a5a", "black" = "#000000"
- "bigger" for titleSize = increase by 4, "smaller" = decrease by 4

Current config: ${JSON.stringify(currentConfig)}
Template: ${templateId}

Return null for any property you're NOT changing. Only include properties that the user explicitly wants to modify.`,
      prompt: `User request: "${message}"

Return the config updates as a JSON object. Only include properties that should change based on this request.`,
      output: Output.object({ schema: configSchema }),
    })

    const updates = result.output
    
    // Filter out null values and get changed keys
    const changedKeys: string[] = []
    const filteredUpdates: Record<string, unknown> = {}
    
    for (const [key, value] of Object.entries(updates)) {
      if (value !== null && value !== undefined) {
        changedKeys.push(key)
        filteredUpdates[key] = value
      }
    }

    return Response.json({
      success: changedKeys.length > 0,
      updates: filteredUpdates,
      changedKeys,
    })
  } catch (error) {
    console.error("Dashboard edit error:", error)
    return Response.json({ success: false, updates: {}, changedKeys: [], error: "Failed to process request" }, { status: 500 })
  }
}
