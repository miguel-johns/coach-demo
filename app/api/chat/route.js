import { streamText, tool } from 'ai'
import { z } from 'zod'

export async function POST(req) {
  const { messages, clients } = await req.json()

  // Build context about all clients for the AI
  const clientContext = clients.map((c, idx) => `
Client ${idx + 1}: ${c.name}
- Program: ${c.program} (started ${c.startDate})
- Weight trend: ${c.weightTrend > 0 ? '+' : ''}${c.weightTrend} lbs
- Current weight: ${c.weightData?.[c.weightData.length - 1] || 'N/A'} lbs
- Protein: ${c.proteinAvg}g avg / ${c.proteinTarget}g target (${c.proteinTarget - c.proteinAvg}g gap)
- Meals logged: ${c.mealsLogged}/28 this month
- Steps: ${c.steps?.toLocaleString() || 'N/A'} daily avg
- Workout days: ${c.workoutDays}/week
- Engagement score: ${c.engagementScore}%
- Alert: ${c.alert} (${c.alertType})
- Streak: ${c.streaks?.best?.days || 0} day ${c.streaks?.best?.type || ''} streak
- Insight: ${c.insight}
- Coach angle: ${c.coachAngle}
- Narrative: ${c.narrative}
`).join('\n')

  const result = streamText({
    model: 'anthropic/claude-sonnet-4-20250514',
    system: `You are Milton, an intelligent AI assistant for health and fitness coaches. You help coaches manage their clients, analyze data, and provide actionable insights.

## Your Personality
- Friendly, professional, and proactive
- Speak naturally like a helpful colleague
- Keep responses concise but informative (2-4 sentences typically)
- Use data to back up your observations
- Be encouraging about client wins and constructive about challenges

## Current Client Data
${clientContext}

## Your Capabilities
You can help coaches with:
1. **Client check-ins** - Summarize how clients are doing, flag concerns
2. **Data analysis** - Analyze nutrition, weight trends, activity patterns
3. **Real-time updates** - Update client programs, targets, and settings using tools
4. **Reports** - Generate insights and progress summaries
5. **Recommendations** - Suggest coaching strategies based on data

## Tool Usage
When a coach asks to change/update/set any client data, you MUST use the appropriate tool to make the change. Always confirm the change was made after using a tool.

## Response Guidelines
- Start with a brief title or topic when appropriate
- Reference specific numbers and data points
- Suggest next steps or actions when relevant
- If asked about a client, always include their current status`,
    messages,
    tools: {
      updateProgram: tool({
        description: 'Change a client\'s training program (e.g., Fat Loss Phase, Muscle Gain, Maintenance, Metabolic Health, Performance)',
        inputSchema: z.object({
          clientName: z.string().describe('The full name of the client'),
          newProgram: z.enum(['Fat Loss Phase', 'Muscle Gain', 'Maintenance', 'Metabolic Health', 'Performance']).describe('The new program to assign'),
        }),
        execute: async ({ clientName, newProgram }) => {
          const clientIdx = clients.findIndex(c => 
            c.name.toLowerCase().includes(clientName.toLowerCase()) ||
            clientName.toLowerCase().includes(c.name.split(' ')[0].toLowerCase())
          )
          if (clientIdx === -1) return { success: false, error: 'Client not found' }
          const oldProgram = clients[clientIdx].program
          return { 
            success: true, 
            clientIdx, 
            change: { program: newProgram },
            message: `Changed ${clients[clientIdx].name}'s program from ${oldProgram} to ${newProgram}`
          }
        },
      }),
      updateProteinTarget: tool({
        description: 'Update a client\'s daily protein target in grams',
        inputSchema: z.object({
          clientName: z.string().describe('The full name of the client'),
          newTarget: z.number().min(30).max(300).describe('The new protein target in grams'),
        }),
        execute: async ({ clientName, newTarget }) => {
          const clientIdx = clients.findIndex(c => 
            c.name.toLowerCase().includes(clientName.toLowerCase()) ||
            clientName.toLowerCase().includes(c.name.split(' ')[0].toLowerCase())
          )
          if (clientIdx === -1) return { success: false, error: 'Client not found' }
          const oldTarget = clients[clientIdx].proteinTarget
          return { 
            success: true, 
            clientIdx, 
            change: { proteinTarget: newTarget },
            message: `Updated ${clients[clientIdx].name}'s protein target from ${oldTarget}g to ${newTarget}g`
          }
        },
      }),
      updateWeight: tool({
        description: 'Update a client\'s current weight',
        inputSchema: z.object({
          clientName: z.string().describe('The full name of the client'),
          newWeight: z.number().min(80).max(400).describe('The new weight in pounds'),
        }),
        execute: async ({ clientName, newWeight }) => {
          const clientIdx = clients.findIndex(c => 
            c.name.toLowerCase().includes(clientName.toLowerCase()) ||
            clientName.toLowerCase().includes(c.name.split(' ')[0].toLowerCase())
          )
          if (clientIdx === -1) return { success: false, error: 'Client not found' }
          const client = clients[clientIdx]
          const newWeightData = [...(client.weightData || [])]
          newWeightData[newWeightData.length - 1] = newWeight
          const weightTrend = Math.round((newWeight - (client.weightData?.[0] || newWeight)) * 10) / 10
          return { 
            success: true, 
            clientIdx, 
            change: { weightData: newWeightData, weightTrend },
            message: `Updated ${client.name}'s weight to ${newWeight} lbs (trend: ${weightTrend > 0 ? '+' : ''}${weightTrend} lbs)`
          }
        },
      }),
      updateStartDate: tool({
        description: 'Update a client\'s program start date',
        inputSchema: z.object({
          clientName: z.string().describe('The full name of the client'),
          newDate: z.string().describe('The new start date (e.g., "Mar 15", "Feb 1")'),
        }),
        execute: async ({ clientName, newDate }) => {
          const clientIdx = clients.findIndex(c => 
            c.name.toLowerCase().includes(clientName.toLowerCase()) ||
            clientName.toLowerCase().includes(c.name.split(' ')[0].toLowerCase())
          )
          if (clientIdx === -1) return { success: false, error: 'Client not found' }
          const oldDate = clients[clientIdx].startDate
          return { 
            success: true, 
            clientIdx, 
            change: { startDate: newDate },
            message: `Updated ${clients[clientIdx].name}'s start date from ${oldDate} to ${newDate}`
          }
        },
      }),
      updateStepsGoal: tool({
        description: 'Update a client\'s daily steps goal',
        inputSchema: z.object({
          clientName: z.string().describe('The full name of the client'),
          newGoal: z.number().min(1000).max(30000).describe('The new daily steps goal'),
        }),
        execute: async ({ clientName, newGoal }) => {
          const clientIdx = clients.findIndex(c => 
            c.name.toLowerCase().includes(clientName.toLowerCase()) ||
            clientName.toLowerCase().includes(c.name.split(' ')[0].toLowerCase())
          )
          if (clientIdx === -1) return { success: false, error: 'Client not found' }
          return { 
            success: true, 
            clientIdx, 
            change: { steps: Math.round(newGoal * 0.85) },
            message: `Updated ${clients[clientIdx].name}'s steps goal to ${newGoal.toLocaleString()} steps/day`
          }
        },
      }),
    },
    maxSteps: 5,
  })

  return result.toUIMessageStreamResponse()
}
