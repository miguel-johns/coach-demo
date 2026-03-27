import { streamText, tool } from "ai"
import { z } from "zod"

// In-memory storage for logged workouts (in production, use a database)
const loggedWorkouts = []

// Demo client dataset with full workout data
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
    week: 6,
    program: "Fat Loss — Phase 2",
    sessionsPerWeek: 4,
    sessionsThisWeek: 3,
    totalSessions: 18,
    recentWorkouts: [
      {
        date: "2026-03-21",
        type: "Lower Body",
        duration: 55,
        exercises: [
          { name: "Barbell Back Squat", sets: [{ weight: 115, reps: 8, rpe: 7 }, { weight: 115, reps: 8, rpe: 7.5 }, { weight: 120, reps: 6, rpe: 8 }] },
          { name: "Romanian Deadlift", sets: [{ weight: 95, reps: 10, rpe: 7 }, { weight: 95, reps: 10, rpe: 7.5 }, { weight: 100, reps: 8, rpe: 8 }] },
          { name: "Leg Press", sets: [{ weight: 180, reps: 12, rpe: 6 }, { weight: 200, reps: 10, rpe: 7 }] },
        ],
        notes: "Felt strong today. Squat depth improving."
      },
      {
        date: "2026-03-19",
        type: "Upper Body Push",
        duration: 50,
        exercises: [
          { name: "Bench Press", sets: [{ weight: 70, reps: 8, rpe: 7 }, { weight: 70, reps: 8, rpe: 7.5 }, { weight: 75, reps: 6, rpe: 8 }] },
          { name: "Overhead Press", sets: [{ weight: 50, reps: 8, rpe: 7.5 }, { weight: 50, reps: 7, rpe: 8 }] },
        ],
        notes: "OHP felt heavy. May need to hold at 50 for another week."
      }
    ],
    strengthProgress: {
      squat: { current: "120x6", baseline: "95x8", change: "+25 lbs" },
      deadlift: { current: "115x6", baseline: "115x6", change: "same" },
      benchPress: { current: "75x6", baseline: "65x8", change: "+10 lbs" }
    }
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
    week: 8,
    program: "Muscle Gain — Hypertrophy",
    sessionsPerWeek: 5,
    sessionsThisWeek: 4,
    totalSessions: 32,
    recentWorkouts: [
      {
        date: "2026-03-21",
        type: "Pull",
        duration: 65,
        exercises: [
          { name: "Conventional Deadlift", sets: [{ weight: 275, reps: 5, rpe: 7 }, { weight: 285, reps: 4, rpe: 8 }, { weight: 295, reps: 3, rpe: 8.5 }] },
          { name: "Barbell Row", sets: [{ weight: 155, reps: 8, rpe: 7 }, { weight: 165, reps: 6, rpe: 8 }] },
          { name: "Lat Pulldown", sets: [{ weight: 120, reps: 10, rpe: 7 }, { weight: 130, reps: 8, rpe: 8 }] },
        ],
        notes: "Deadlift moving well. Ready to test 300."
      },
      {
        date: "2026-03-19",
        type: "Push",
        duration: 60,
        exercises: [
          { name: "Bench Press", sets: [{ weight: 170, reps: 6, rpe: 7 }, { weight: 175, reps: 5, rpe: 7.5 }, { weight: 180, reps: 4, rpe: 8 }] },
          { name: "Overhead Press", sets: [{ weight: 110, reps: 6, rpe: 7 }, { weight: 115, reps: 5, rpe: 8 }] },
        ],
        notes: "Bench PR - 180x4!"
      }
    ],
    strengthProgress: {
      squat: { current: "235x4", baseline: "185x5", change: "+50 lbs" },
      deadlift: { current: "295x3", baseline: "245x5", change: "+50 lbs" },
      benchPress: { current: "180x4", baseline: "155x5", change: "+25 lbs" }
    }
  },
  {
    name: "Emily Rodriguez",
    goal: "Improve energy and relationship with food",
    status: "moderate",
    issue: "Missed last 2 sessions. Needs programming refresh.",
    action: "Schedule call about sustainable eating",
    loggingStreak: 5,
    protein: "68g (target: 100g)",
    weight: "fluctuating +/- 2 lbs",
    week: 4,
    program: "General Fitness",
    sessionsPerWeek: 3,
    sessionsThisWeek: 0,
    totalSessions: 8,
    recentWorkouts: [
      {
        date: "2026-03-10",
        type: "Full Body",
        duration: 45,
        exercises: [
          { name: "Goblet Squat", sets: [{ weight: 25, reps: 10, rpe: 7 }, { weight: 25, reps: 10, rpe: 7.5 }] },
          { name: "Dumbbell Row", sets: [{ weight: 20, reps: 10, rpe: 6.5 }, { weight: 20, reps: 10, rpe: 7 }] },
          { name: "Push-ups (Incline)", sets: [{ weight: 0, reps: 8, rpe: 7 }, { weight: 0, reps: 6, rpe: 8 }] },
        ],
        notes: "Good energy today. Push-ups are improving!"
      }
    ],
    strengthProgress: {
      squat: { current: "25x10 goblet", baseline: "20x8 goblet", change: "+5 lbs" },
      benchPress: { current: "Incline push-ups x8", baseline: "Wall push-ups", change: "progressed" }
    }
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
    week: 10,
    program: "Powerlifting Prep",
    sessionsPerWeek: 4,
    sessionsThisWeek: 3,
    totalSessions: 28,
    recentWorkouts: [
      {
        date: "2026-03-21",
        type: "Squat Day",
        duration: 75,
        exercises: [
          { name: "Barbell Back Squat", sets: [{ weight: 245, reps: 3, rpe: 6 }, { weight: 275, reps: 3, rpe: 7 }, { weight: 295, reps: 2, rpe: 8 }] },
          { name: "Pause Squat", sets: [{ weight: 225, reps: 3, rpe: 7 }, { weight: 225, reps: 3, rpe: 7.5 }] },
        ],
        notes: "295 moved well. 315 is within reach in 4-6 weeks."
      },
      {
        date: "2026-03-19",
        type: "Bench Day",
        duration: 65,
        exercises: [
          { name: "Bench Press", sets: [{ weight: 185, reps: 3, rpe: 6.5 }, { weight: 195, reps: 3, rpe: 7.5 }, { weight: 205, reps: 2, rpe: 8.5 }] },
        ],
        notes: "205 is a PR! 225 by meet day looking good."
      }
    ],
    strengthProgress: {
      squat: { current: "295x2", baseline: "275x3", change: "+20 lbs" },
      deadlift: { current: "365x1", baseline: "315x3", change: "+50 lbs" },
      benchPress: { current: "205x2", baseline: "185x3", change: "+20 lbs (PR!)" }
    }
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
    week: 2,
    program: "Post-Pregnancy Recovery",
    sessionsPerWeek: 2,
    sessionsThisWeek: 2,
    totalSessions: 4,
    recentWorkouts: [
      {
        date: "2026-03-20",
        type: "Full Body A",
        duration: 35,
        exercises: [
          { name: "Goblet Squat", sets: [{ weight: 15, reps: 10, rpe: 6 }, { weight: 15, reps: 10, rpe: 6.5 }] },
          { name: "Seated Row (Machine)", sets: [{ weight: 40, reps: 12, rpe: 6 }, { weight: 40, reps: 12, rpe: 6 }] },
          { name: "Glute Bridge", sets: [{ weight: 0, reps: 15, rpe: 5 }, { weight: 0, reps: 15, rpe: 5.5 }] },
        ],
        notes: "First week back! Taking it easy, focusing on form."
      }
    ],
    strengthProgress: {
      squat: { current: "15x10 goblet", baseline: "Starting fresh", change: "N/A" }
    }
  }
]

function formatWorkout(workout) {
  const exercises = workout.exercises.map(ex => {
    const setDetails = ex.sets.map((s, i) => `Set ${i+1}: ${s.weight}lbs x ${s.reps} @ RPE ${s.rpe}`).join(', ')
    return `    - ${ex.name}: ${setDetails}`
  }).join('\n')
  return `  ${workout.date} - ${workout.type} (${workout.duration} min)\n${exercises}\n    Notes: ${workout.notes}`
}

function buildSystemPrompt() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  
  const clientData = demoClients.map(c => {
    const workoutHistory = c.recentWorkouts ? c.recentWorkouts.map(formatWorkout).join('\n') : 'No recent workouts'
    const strengthData = c.strengthProgress ? Object.entries(c.strengthProgress).map(([lift, data]) => 
      `    - ${lift}: ${data.current} (${data.change} from baseline)`
    ).join('\n') : ''
    
    return `
**${c.name}** (Week ${c.week}, ${c.status})
- Goal: ${c.goal}
- Program: ${c.program}
- ${c.issue ? `Issue: ${c.issue}` : `Win: ${c.win}`}
- Logging streak: ${c.loggingStreak} days
- Protein: ${c.protein}
- Weight: ${c.weight}
- Sessions: ${c.sessionsThisWeek}/${c.sessionsPerWeek} this week, ${c.totalSessions} total
- Recommended: ${c.action}
- Strength Progress:
${strengthData}
- Recent Workouts:
${workoutHistory}`
  }).join('\n')

  // Include any recently logged workouts
  const recentLogs = loggedWorkouts.length > 0 
    ? `\n\n## Recently Logged Workouts (via chat):\n${loggedWorkouts.map(w => 
        `- ${w.clientName}: ${w.type} on ${w.date} - ${w.exercises.map(e => `${e.name} ${e.sets}x${e.reps}@${e.weight}lbs`).join(', ')}`
      ).join('\n')}`
    : ''

  return `You are Milton, an AI coaching copilot for nutrition and fitness coaches. You have real-time access to all client data including their workout history and exercise performance.

## Your Personality
- Warm but efficient — like a trusted colleague
- Action-oriented — always suggest a clear next step
- Concise — keep responses to 2-4 sentences unless asked for more detail

## Capabilities
You can:
1. View all client workout data, including exercises, sets, reps, weights, and RPE
2. Log new workouts or exercises for clients using the logWorkout tool
3. Provide analysis on strength progress and training patterns
4. Answer questions about what clients did in their last session

## Response Rules
- ONLY reference the 5 clients listed below — never invent clients or data
- Use specific names and numbers from the data
- When asked about workouts: reference actual exercise data with weights/reps/RPE
- When asked "what did X do last session": provide detailed exercise breakdown
- When logging a workout: use the logWorkout tool, then confirm what was logged
- When asked "who needs attention": prioritize Sarah (at-risk) and Emily (moderate concern)
- When asked to write a message: write it ready to copy/paste, casual and encouraging tone
- When summarizing: use bullet points
- When asked "who is doing well": highlight Marcus and David

## Current Client Roster (5 clients):
${clientData}
${recentLogs}

## Today's Context
- Date: ${today}
- Clients needing attention: Sarah Chen (at-risk), Emily Rodriguez (moderate)
- Clients doing well: Marcus Johnson, David Park
- New client: Rachel Kim (week 2)

Remember: Be specific, be brief, be helpful. You have FULL access to workout data!`
}

// Define tools for workout logging
const workoutTools = {
  logWorkout: tool({
    description: 'Log a workout session for a client. Use this when the coach wants to record a workout, exercise, or training session for any client.',
    inputSchema: z.object({
      clientName: z.string().describe('The name of the client (e.g., "Sarah Chen", "Marcus Johnson")'),
      date: z.string().describe('The date of the workout in YYYY-MM-DD format'),
      type: z.string().describe('The type of workout (e.g., "Upper Body", "Lower Body", "Full Body", "Push", "Pull", "Legs")'),
      duration: z.number().describe('Duration of the workout in minutes'),
      exercises: z.array(z.object({
        name: z.string().describe('Name of the exercise (e.g., "Barbell Back Squat", "Bench Press")'),
        sets: z.number().describe('Number of sets performed'),
        reps: z.number().describe('Number of reps per set'),
        weight: z.number().describe('Weight used in pounds'),
        rpe: z.number().nullable().describe('Rate of Perceived Exertion (1-10 scale, optional)')
      })).describe('List of exercises performed'),
      notes: z.string().nullable().describe('Optional notes about the workout')
    }),
    execute: async ({ clientName, date, type, duration, exercises, notes }) => {
      // Validate client exists
      const client = demoClients.find(c => c.name.toLowerCase() === clientName.toLowerCase())
      if (!client) {
        return { success: false, error: `Client "${clientName}" not found. Available clients: ${demoClients.map(c => c.name).join(', ')}` }
      }
      
      // Store the workout
      const workout = {
        clientName: client.name,
        date,
        type,
        duration,
        exercises,
        notes: notes || '',
        loggedAt: new Date().toISOString()
      }
      loggedWorkouts.push(workout)
      
      // Format confirmation
      const exerciseSummary = exercises.map(e => `${e.name}: ${e.sets}x${e.reps} @ ${e.weight}lbs${e.rpe ? ` (RPE ${e.rpe})` : ''}`).join(', ')
      
      return { 
        success: true, 
        message: `Logged ${type} workout for ${client.name} on ${date}`,
        summary: exerciseSummary,
        duration: `${duration} minutes`,
        notes: notes || 'None'
      }
    }
  }),
  
  logExercise: tool({
    description: 'Quickly log a single exercise for a client. Use this for quick logging when the coach mentions just one exercise.',
    inputSchema: z.object({
      clientName: z.string().describe('The name of the client'),
      exerciseName: z.string().describe('Name of the exercise'),
      sets: z.number().describe('Number of sets'),
      reps: z.number().describe('Number of reps'),
      weight: z.number().describe('Weight in pounds'),
      rpe: z.number().nullable().describe('Rate of Perceived Exertion (optional)')
    }),
    execute: async ({ clientName, exerciseName, sets, reps, weight, rpe }) => {
      const client = demoClients.find(c => c.name.toLowerCase() === clientName.toLowerCase())
      if (!client) {
        return { success: false, error: `Client "${clientName}" not found.` }
      }
      
      const today = new Date().toISOString().split('T')[0]
      const exercise = { name: exerciseName, sets, reps, weight, rpe }
      
      // Check if there's already a workout today for this client
      const existingToday = loggedWorkouts.find(w => w.clientName === client.name && w.date === today)
      if (existingToday) {
        existingToday.exercises.push(exercise)
        return { 
          success: true, 
          message: `Added ${exerciseName} to ${client.name}'s workout today`,
          exercise: `${sets}x${reps} @ ${weight}lbs${rpe ? ` (RPE ${rpe})` : ''}`
        }
      }
      
      // Create new quick workout
      loggedWorkouts.push({
        clientName: client.name,
        date: today,
        type: 'Quick Log',
        duration: 0,
        exercises: [exercise],
        notes: '',
        loggedAt: new Date().toISOString()
      })
      
      return { 
        success: true, 
        message: `Logged ${exerciseName} for ${client.name}`,
        exercise: `${sets}x${reps} @ ${weight}lbs${rpe ? ` (RPE ${rpe})` : ''}`
      }
    }
  }),
  
  getClientWorkouts: tool({
    description: 'Get detailed workout history for a specific client',
    inputSchema: z.object({
      clientName: z.string().describe('The name of the client to look up')
    }),
    execute: async ({ clientName }) => {
      const client = demoClients.find(c => c.name.toLowerCase() === clientName.toLowerCase())
      if (!client) {
        return { success: false, error: `Client "${clientName}" not found.` }
      }
      
      // Get logged workouts for this client
      const logged = loggedWorkouts.filter(w => w.clientName === client.name)
      
      return {
        success: true,
        client: client.name,
        program: client.program,
        sessionsThisWeek: client.sessionsThisWeek,
        sessionsPerWeek: client.sessionsPerWeek,
        totalSessions: client.totalSessions,
        strengthProgress: client.strengthProgress,
        recentWorkouts: client.recentWorkouts,
        newlyLoggedWorkouts: logged
      }
    }
  })
}

// Vercel Serverless Function handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { messages } = req.body
    const systemPrompt = buildSystemPrompt()

    const result = await streamText({
      model: 'anthropic/claude-sonnet-4-20250514',
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.type === "user" ? "user" : "assistant",
        content: m.text || "",
      })),
      tools: workoutTools,
      maxSteps: 5, // Allow multiple tool calls if needed
    })

    // Collect the full response
    let fullText = ''
    for await (const chunk of result.textStream) {
      fullText += chunk
    }

    res.status(200).json({ text: fullText })
  } catch (error) {
    console.error('[v0] Chat API error:', error)
    res.status(500).json({ 
      error: 'Failed to generate response', 
      details: error.message,
      name: error.name,
      cause: error.cause ? String(error.cause) : undefined
    })
  }
}
