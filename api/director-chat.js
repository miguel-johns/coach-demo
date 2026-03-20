import { streamText } from "ai"
import { createAnthropic } from "@ai-sdk/anthropic"

// Demo trainer data matching the frontend
const demoTrainers = [
  {
    name: "Jordan Mitchell",
    quadrant: "star",
    financialScore: 92,
    outcomesScore: 88,
    revenue: 18500,
    sessions: 48,
    packages: 6,
    clientLTV: 4200,
    activeClients: 12,
    retentionRate: 94,
    loggingCompliance: 85,
    nutritionAdherence: 78,
    milestones: 14,
    churnRisk: 2,
    utilizationRate: 88,
    availableSlots: 4,
    insight: "Top performer with strong client outcomes. Maximizing revenue potential."
  },
  {
    name: "Alex Rivera",
    quadrant: "salesperson",
    financialScore: 85,
    outcomesScore: 72,
    revenue: 15200,
    sessions: 52,
    packages: 8,
    clientLTV: 3100,
    activeClients: 16,
    retentionRate: 78,
    loggingCompliance: 62,
    nutritionAdherence: 58,
    milestones: 8,
    churnRisk: 5,
    utilizationRate: 95,
    availableSlots: 2,
    insight: "High session volume but lower client outcomes. May be over-selling without follow-through."
  },
  {
    name: "Sam Patel",
    quadrant: "hiddenGem",
    financialScore: 58,
    outcomesScore: 91,
    revenue: 9800,
    sessions: 32,
    packages: 3,
    clientLTV: 5100,
    activeClients: 8,
    retentionRate: 96,
    loggingCompliance: 92,
    nutritionAdherence: 88,
    milestones: 18,
    churnRisk: 1,
    utilizationRate: 65,
    availableSlots: 12,
    insight: "Exceptional client outcomes but underutilized. Has capacity for more clients."
  },
  {
    name: "Taylor Kim",
    quadrant: "underperformer",
    financialScore: 45,
    outcomesScore: 42,
    revenue: 6200,
    sessions: 24,
    packages: 2,
    clientLTV: 2200,
    activeClients: 6,
    retentionRate: 65,
    loggingCompliance: 48,
    nutritionAdherence: 42,
    milestones: 3,
    churnRisk: 4,
    utilizationRate: 52,
    availableSlots: 18,
    insight: "Struggling in both metrics. Needs additional training or coaching support."
  },
  {
    name: "Morgan Chen",
    quadrant: "star",
    financialScore: 78,
    outcomesScore: 82,
    revenue: 14200,
    sessions: 44,
    packages: 5,
    clientLTV: 3800,
    activeClients: 11,
    retentionRate: 89,
    loggingCompliance: 79,
    nutritionAdherence: 75,
    milestones: 12,
    churnRisk: 2,
    utilizationRate: 82,
    availableSlots: 6,
    insight: "Solid performer with balanced metrics. Room for growth in both areas."
  },
  {
    name: "Casey Brooks",
    quadrant: "salesperson",
    financialScore: 68,
    outcomesScore: 55,
    revenue: 11800,
    sessions: 38,
    packages: 4,
    clientLTV: 2900,
    activeClients: 10,
    retentionRate: 72,
    loggingCompliance: 55,
    nutritionAdherence: 52,
    milestones: 6,
    churnRisk: 4,
    utilizationRate: 78,
    availableSlots: 8,
    insight: "Decent revenue but client outcomes need improvement. Consider process changes."
  }
]

const programData = [
  { name: "Fat Loss Phase", enrolled: 28, revenue: 42000, completionRate: 82, avgOutcome: 8.2 },
  { name: "Muscle Gain", enrolled: 22, revenue: 35200, completionRate: 78, avgOutcome: 7.8 },
  { name: "Metabolic Health", enrolled: 18, revenue: 27000, completionRate: 85, avgOutcome: 8.5 },
  { name: "Post-Pregnancy", enrolled: 12, revenue: 19200, completionRate: 90, avgOutcome: 9.1 },
  { name: "Athletic Performance", enrolled: 15, revenue: 30000, completionRate: 72, avgOutcome: 7.2 }
]

function buildDirectorSystemPrompt(trainers, selectedTrainer) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  
  // Calculate summary stats
  const totalRevenue = trainers.reduce((sum, t) => sum + t.revenue, 0)
  const avgRetention = Math.round(trainers.reduce((sum, t) => sum + t.retentionRate, 0) / trainers.length)
  const totalClients = trainers.reduce((sum, t) => sum + t.activeClients, 0)
  const avgUtilization = Math.round(trainers.reduce((sum, t) => sum + t.utilizationRate, 0) / trainers.length)
  
  const trainerData = trainers.map(t => `
**${t.name}** (${t.quadrant === "star" ? "Star" : t.quadrant === "salesperson" ? "Salesperson" : t.quadrant === "hiddenGem" ? "Hidden Gem" : "Underperformer"})
- Financial Score: ${t.financialScore}/100 | Outcomes Score: ${t.outcomesScore}/100
- Revenue: $${t.revenue.toLocaleString()} | ${t.activeClients} clients | ${t.sessions} sessions
- Client LTV: $${t.clientLTV} | Retention: ${t.retentionRate}%
- Compliance: ${t.loggingCompliance}% logging, ${t.nutritionAdherence}% nutrition
- Utilization: ${t.utilizationRate}% | ${t.availableSlots} slots available
- At-risk clients: ${t.churnRisk}
- Insight: ${t.insight}`).join('\n')

  const programSummary = programData.map(p => 
    `- ${p.name}: ${p.enrolled} enrolled, $${(p.revenue/1000).toFixed(1)}k revenue, ${p.completionRate}% completion, ${p.avgOutcome}/10 outcomes`
  ).join('\n')

  let contextNote = ""
  if (selectedTrainer) {
    contextNote = `\n\n## Currently Selected Trainer
The director is currently viewing detailed data for **${selectedTrainer.name}**. Prioritize insights about this trainer when relevant.`
  }

  return `You are Milton Director AI, an analytics copilot for fitness business directors and owners. You help directors understand trainer performance, optimize staffing decisions, and maximize both revenue and client outcomes.

## Your Personality
- Strategic and analytical — think like a business advisor
- Data-driven — always cite specific metrics from the data
- Action-oriented — recommend concrete decisions
- Balanced — consider both financial and outcomes metrics

## Response Rules
- ONLY reference the 6 trainers listed below — never invent trainers or data
- Use specific names, numbers, and percentages from the data
- When analyzing the ROI matrix, explain the quadrant meanings:
  - **Stars** (high financial + high outcomes): Top performers, invest in
  - **Salespeople** (high financial + low outcomes): Revenue drivers but may cause churn
  - **Hidden Gems** (low financial + high outcomes): Great coaches needing sales support
  - **Underperformers** (low financial + low outcomes): Need development or reconsideration
- When asked about staffing: consider utilization rates and available slots
- When discussing retention risk: be specific about which trainer's clients are at risk
- Keep responses focused and actionable — 3-5 sentences unless detailed analysis requested

## Current Team Summary
- Total Revenue: $${totalRevenue.toLocaleString()}
- Average Retention: ${avgRetention}%
- Total Active Clients: ${totalClients}
- Team Utilization: ${avgUtilization}%

## Trainer Roster (6 trainers):
${trainerData}

## Programs Overview:
${programSummary}
${contextNote}

## Today's Context
- Date: ${today}
- Key insight: Sam Patel (Hidden Gem) has 12 available slots and highest client LTV — opportunity for growth
- Risk alert: Alex Rivera and Taylor Kim have elevated churn risk (5 and 4 clients respectively)
- Capacity note: Alex Rivera at 95% utilization — may need relief

Remember: Be strategic, be specific, be actionable.`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { messages, selectedTrainer } = req.body
    
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
    }

    const anthropic = createAnthropic({ apiKey })
    const systemPrompt = buildDirectorSystemPrompt(demoTrainers, selectedTrainer)

    // Set up streaming response headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content || "",
      })),
    })

    // Stream the response
    const stream = result.toDataStream()
    const reader = stream.getReader()
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const text = new TextDecoder().decode(value)
      res.write(text)
    }
    
    res.end()
  } catch (error) {
    console.error('[v0] Director chat API error:', error)
    
    // If headers already sent, can't send JSON error
    if (res.headersSent) {
      res.end()
      return
    }
    
    res.status(500).json({ 
      error: 'Failed to generate response', 
      details: error.message 
    })
  }
}
