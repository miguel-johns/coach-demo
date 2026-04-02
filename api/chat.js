import { streamText, tool } from "ai"
import { z } from "zod"

// In-memory storage for logged workouts and meals (in production, use a database)
const loggedWorkouts = []
const loggedMeals = []

// Demo client dataset with full workout AND nutrition data
const demoClients = [
  {
    name: "Sarah Chen",
    goal: "Lose 15 lbs for wedding in 3 months",
    status: "at-risk",
    issue: "Missed logging for 4 days straight",
    action: "Send a supportive check-in message",
    loggingStreak: 0,
    week: 6,
    program: "Fat Loss — Phase 2",
    sessionsPerWeek: 4,
    sessionsThisWeek: 3,
    totalSessions: 18,
    trainerNotes: [
      { date: "2026-03-21", note: "Squat depth improving but still rounding lower back at bottom. Cue: chest up, brace harder." },
      { date: "2026-03-19", note: "Mentioned stress from wedding planning. Keep sessions energizing, maybe add fun finishers." }
    ],
    nutrition: {
      tracking: true,
      proteinAvg: 95,
      proteinTarget: 120,
      calorieAvg: 1650,
      calorieTarget: 1800,
      carbsAvg: 140,
      carbsTarget: 160,
      fatAvg: 55,
      fatTarget: 60,
      proteinStreak: 0,
      mealLoggingStreak: 0,
      daysLowProtein: 4,
      recentMeals: [
        { date: "2026-03-17", type: "lunch", calories: 480, protein: 22, carbs: 45, fat: 18, foods: "Salad with grilled chicken, light dressing" },
        { date: "2026-03-17", type: "dinner", calories: 520, protein: 28, carbs: 50, fat: 20, foods: "Salmon, rice, vegetables" }
      ],
      weeklyTrends: {
        proteinAvg: 92,
        calorieAvg: 1620,
        loggingRate: 0.45
      }
    },
    weight: { current: 158, change: "+1.2 lbs this week", trend: "up" },
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
    week: 8,
    program: "Muscle Gain — Hypertrophy",
    sessionsPerWeek: 5,
    sessionsThisWeek: 4,
    totalSessions: 32,
    trainerNotes: [
      { date: "2026-03-21", note: "Deadlift form is dialed. Ready to test 300. Consider adding deficit pulls next phase." },
      { date: "2026-03-19", note: "Bench PR! 180x4. Very pumped. Good energy, great session overall." }
    ],
    nutrition: {
      tracking: true,
      proteinAvg: 185,
      proteinTarget: 180,
      calorieAvg: 2850,
      calorieTarget: 2800,
      carbsAvg: 320,
      carbsTarget: 300,
      fatAvg: 85,
      fatTarget: 90,
      proteinStreak: 7,
      mealLoggingStreak: 14,
      daysLowProtein: 0,
      recentMeals: [
        { date: "2026-03-21", type: "breakfast", calories: 650, protein: 45, carbs: 60, fat: 22, foods: "Eggs, oatmeal, protein shake" },
        { date: "2026-03-21", type: "lunch", calories: 780, protein: 52, carbs: 70, fat: 28, foods: "Chicken breast, rice, broccoli" },
        { date: "2026-03-21", type: "dinner", calories: 820, protein: 48, carbs: 85, fat: 25, foods: "Steak, sweet potato, asparagus" },
        { date: "2026-03-21", type: "snack", calories: 400, protein: 35, carbs: 45, fat: 10, foods: "Greek yogurt, berries, protein bar" }
      ],
      weeklyTrends: {
        proteinAvg: 183,
        calorieAvg: 2820,
        loggingRate: 0.95
      }
    },
    weight: { current: 188, change: "+0.8 lbs (on track)", trend: "up" },
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
    week: 4,
    program: "General Fitness",
    sessionsPerWeek: 3,
    sessionsThisWeek: 0,
    totalSessions: 8,
    trainerNotes: [
      { date: "2026-03-10", note: "Energy was good but mentioned feeling overwhelmed with work. Keep sessions under 45 min." },
      { date: "2026-03-07", note: "Loves the push-up progression. Very motivated by visible progress on bodyweight movements." }
    ],
    nutrition: {
      tracking: true,
      proteinAvg: 68,
      proteinTarget: 100,
      calorieAvg: 1450,
      calorieTarget: 1700,
      carbsAvg: 160,
      carbsTarget: 180,
      fatAvg: 48,
      fatTarget: 55,
      proteinStreak: 0,
      mealLoggingStreak: 5,
      daysLowProtein: 12,
      recentMeals: [
        { date: "2026-03-21", type: "breakfast", calories: 320, protein: 12, carbs: 45, fat: 12, foods: "Toast, banana, coffee" },
        { date: "2026-03-21", type: "lunch", calories: 480, protein: 18, carbs: 55, fat: 16, foods: "Pasta salad, fruit" },
        { date: "2026-03-20", type: "dinner", calories: 550, protein: 24, carbs: 50, fat: 18, foods: "Tacos, beans, rice" }
      ],
      weeklyTrends: {
        proteinAvg: 65,
        calorieAvg: 1420,
        loggingRate: 0.75
      }
    },
    weight: { current: 142, change: "+/- 2 lbs fluctuating", trend: "stable" },
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
    week: 10,
    program: "Powerlifting Prep",
    sessionsPerWeek: 4,
    sessionsThisWeek: 3,
    totalSessions: 28,
    trainerNotes: [
      { date: "2026-03-21", note: "295 squat moved well. 315 is 4-6 weeks out. Pause squats are building confidence in the hole." },
      { date: "2026-03-19", note: "205 bench PR! On track for 225 by meet. Keep grinding accessories." }
    ],
    nutrition: {
      tracking: true,
      proteinAvg: 165,
      proteinTarget: 160,
      calorieAvg: 2100,
      calorieTarget: 2100,
      carbsAvg: 210,
      carbsTarget: 220,
      fatAvg: 65,
      fatTarget: 70,
      proteinStreak: 21,
      mealLoggingStreak: 21,
      daysLowProtein: 0,
      recentMeals: [
        { date: "2026-03-21", type: "breakfast", calories: 520, protein: 42, carbs: 50, fat: 18, foods: "Egg whites, whole grain toast, turkey bacon" },
        { date: "2026-03-21", type: "lunch", calories: 620, protein: 48, carbs: 55, fat: 20, foods: "Grilled chicken salad, quinoa" },
        { date: "2026-03-21", type: "dinner", calories: 680, protein: 52, carbs: 60, fat: 22, foods: "Lean beef, brown rice, green beans" },
        { date: "2026-03-21", type: "snack", calories: 280, protein: 28, carbs: 25, fat: 8, foods: "Cottage cheese, almonds" }
      ],
      weeklyTrends: {
        proteinAvg: 168,
        calorieAvg: 2080,
        loggingRate: 1.0
      }
    },
    weight: { current: 195, change: "flat for 14 days", trend: "plateau" },
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
    week: 2,
    program: "Post-Pregnancy Recovery",
    sessionsPerWeek: 2,
    sessionsThisWeek: 2,
    totalSessions: 4,
    trainerNotes: [
      { date: "2026-03-20", note: "First week back! Keeping it light. Core reconnection is priority - glute bridges feeling good." },
      { date: "2026-03-18", note: "Very motivated to get back in shape. Go slow - she'll want to push but needs to rebuild foundation." }
    ],
    nutrition: {
      tracking: true,
      proteinAvg: 85,
      proteinTarget: 110,
      calorieAvg: 1900,
      calorieTarget: 2000,
      carbsAvg: 200,
      carbsTarget: 220,
      fatAvg: 65,
      fatTarget: 70,
      proteinStreak: 0,
      mealLoggingStreak: 2,
      daysLowProtein: 5,
      recentMeals: [
        { date: "2026-03-21", type: "breakfast", calories: 380, protein: 18, carbs: 45, fat: 14, foods: "Overnight oats with nuts" },
        { date: "2026-03-21", type: "lunch", calories: 520, protein: 25, carbs: 55, fat: 18, foods: "Leftover chicken stir-fry" },
        { date: "2026-03-20", type: "dinner", calories: 600, protein: 30, carbs: 60, fat: 22, foods: "Fish, roasted vegetables, rice" }
      ],
      weeklyTrends: {
        proteinAvg: 82,
        calorieAvg: 1850,
        loggingRate: 0.60
      }
    },
    weight: { current: 148, change: "-0.5 lbs (healthy pace)", trend: "down" },
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

// Message templates for follow-ups
const messageTemplates = {
  lowProtein: (name, current, target, days) => 
    `Hey ${name.split(' ')[0]}! Noticed protein's been a bit low the past ${days} days (averaging ${current}g vs your ${target}g target). Any challenges with meals this week? Happy to brainstorm some easy high-protein options that fit your schedule.`,
  
  missedSession: (name, days) =>
    `Hey ${name.split(' ')[0]}! Haven't seen you log in ${days} days - everything okay? No pressure, just checking in. When you're ready, we can pick back up wherever works for you.`,
  
  // REBOOKING - The most important follow-up!
  rebookSession: (name, missedCount, lastWorkout) =>
    `Hey ${name.split(' ')[0]}! Wanted to check in - looks like we haven't connected in a bit${lastWorkout ? ` (last session was ${lastWorkout})` : ''}. Life happens! When works best to get you back on track? I can work with whatever fits your schedule this week.`,
  
  rebookUrgent: (name, daysSinceSession) =>
    `Hey ${name.split(' ')[0]}! Missing you at the gym! It's been ${daysSinceSession} days since your last session. Let's get something on the calendar - even a quick 30-min session to keep momentum. What day works this week?`,
  
  rebookGentle: (name) =>
    `Hey ${name.split(' ')[0]}! Just checking in - how's everything going? Whenever you're ready to jump back in, I'm here. No pressure, just want you to know I've got your back.`,
  
  proteinStreak: (name, days) =>
    `${name.split(' ')[0]}! ${days} days straight hitting your protein target - that's huge! Your consistency is really showing in your progress. Keep it up!`,
  
  mealLoggingStreak: (name, days) =>
    `${name.split(' ')[0]}, ${days} days of consistent meal logging! That kind of awareness is what drives real results. Proud of you!`,
  
  weightPlateau: (name, days) =>
    `Hey ${name.split(' ')[0]}, I noticed your weight's been flat for about ${days} days. Since your adherence has been solid, this might be a good time to discuss a small macro adjustment or even a diet break. What do you think?`,
  
  nearGoal: (name, metric, current, target) =>
    `${name.split(' ')[0]}, you're getting close to your ${metric} goal! Currently at ${current}, target is ${target}. Let's make sure this next week sets you up to crush it.`,
  
  newClientEncouragement: (name, week) =>
    `${name.split(' ')[0]}, week ${week} in the books! How are you feeling so far? Any questions or things you'd like to adjust?`,
    
  lowCalories: (name, current, target) =>
    `Hey ${name.split(' ')[0]}, noticed your calories have been running a bit low (${current} vs ${target} target). Just want to make sure you're fueling enough for your goals. Everything okay?`
}

// Generate proactive alerts based on client data
function generateProactiveAlerts(clients) {
  const alerts = []
  const today = new Date()
  const dayOfWeek = today.getDay()
  
  clients.forEach(c => {
    const n = c.nutrition || {}
    
    // Skip nutrition alerts if no nutrition data
    if (!n.proteinTarget) return
    
    // URGENT: Low protein for extended period
    if (n.daysLowProtein >= 3 && n.proteinAvg < n.proteinTarget * 0.75) {
      alerts.push({
        priority: 'urgent',
        client: c.name,
        type: 'nutrition',
        message: `${c.name}: Protein ${Math.round((1 - n.proteinAvg/n.proteinTarget) * 100)}% below target for ${n.daysLowProtein} days`,
        suggestedAction: 'Check in about meal challenges',
        template: messageTemplates.lowProtein(c.name, n.proteinAvg, n.proteinTarget, n.daysLowProtein)
      })
    }
    
    // URGENT: Missed sessions this week (check after Wednesday)
    if (c.sessionsThisWeek === 0 && dayOfWeek > 3 && c.status !== 'new-client') {
      alerts.push({
        priority: 'urgent',
        client: c.name,
        type: 'engagement',
        message: `${c.name}: No sessions logged this week`,
        suggestedAction: 'Send supportive check-in',
        template: messageTemplates.missedSession(c.name, dayOfWeek)
      })
    }
    
    // MODERATE: Low calories (only if we have detailed nutrition data)
    if (n.calorieAvg && n.calorieTarget && n.weeklyTrends && n.calorieAvg < n.calorieTarget * 0.85 && n.weeklyTrends.loggingRate > 0.5) {
      alerts.push({
        priority: 'moderate',
        client: c.name,
        type: 'nutrition',
        message: `${c.name}: Calories ${Math.round((1 - n.calorieAvg/n.calorieTarget) * 100)}% below target`,
        suggestedAction: 'Discuss fueling strategy',
        template: messageTemplates.lowCalories(c.name, n.calorieAvg, n.calorieTarget)
      })
    }
    
    // MODERATE: Weight plateau with good adherence (only if we have weight data)
    if (c.weight && c.weight.trend === 'plateau' && n.mealLoggingStreak >= 14) {
      alerts.push({
        priority: 'moderate',
        client: c.name,
        type: 'progress',
        message: `${c.name}: Weight plateau for 2+ weeks despite good adherence`,
        suggestedAction: 'Consider macro adjustment or diet break',
        template: messageTemplates.weightPlateau(c.name, 14)
      })
    }
    
    // POSITIVE: Protein streak
    if (n.proteinStreak >= 5) {
      alerts.push({
        priority: 'positive',
        client: c.name,
        type: 'win',
        message: `${c.name}: ${n.proteinStreak}-day protein streak!`,
        suggestedAction: 'Send recognition message',
        template: messageTemplates.proteinStreak(c.name, n.proteinStreak)
      })
    }
    
    // POSITIVE: Meal logging streak
    if (n.mealLoggingStreak >= 7 && n.mealLoggingStreak !== n.proteinStreak) {
      alerts.push({
        priority: 'positive',
        client: c.name,
        type: 'win',
        message: `${c.name}: ${n.mealLoggingStreak}-day meal logging streak`,
        suggestedAction: 'Acknowledge consistency',
        template: messageTemplates.mealLoggingStreak(c.name, n.mealLoggingStreak)
      })
    }
    
    // NEW CLIENT: Week 2 check-in
    if (c.status === 'new-client' && c.week === 2) {
      alerts.push({
        priority: 'moderate',
        client: c.name,
        type: 'engagement',
        message: `${c.name}: New client finishing week 2`,
        suggestedAction: 'Check in on experience so far',
        template: messageTemplates.newClientEncouragement(c.name, c.week)
      })
    }
  })
  
  // Sort by priority: urgent first, then moderate, then positive
  const priorityOrder = { urgent: 0, moderate: 1, positive: 2 }
  alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  
  return alerts
}

function formatWorkout(workout) {
  const exercises = workout.exercises.map(ex => {
    const setDetails = ex.sets.map((s, i) => `Set ${i+1}: ${s.weight}lbs x ${s.reps} @ RPE ${s.rpe}`).join(', ')
    return `    - ${ex.name}: ${setDetails}`
  }).join('\n')
  return `  ${workout.date} - ${workout.type} (${workout.duration} min)\n${exercises}\n    Notes: ${workout.notes}`
}

function formatNutrition(nutrition) {
  if (!nutrition) return '  - No nutrition data available'
  const n = nutrition
  const hasDetailedData = n.carbsTarget && n.fatTarget && n.weeklyTrends
  
  if (hasDetailedData) {
    return `  - Daily Targets: ${n.proteinTarget}g protein, ${n.calorieTarget} cal, ${n.carbsTarget}g carbs, ${n.fatTarget}g fat
  - Current Averages: ${n.proteinAvg}g protein (${Math.round(n.proteinAvg/n.proteinTarget*100)}%), ${n.calorieAvg} cal, ${n.carbsAvg}g carbs, ${n.fatAvg}g fat
  - Protein Streak: ${n.proteinStreak || 0} days hitting target
  - Meal Logging Streak: ${n.mealLoggingStreak || 0} days
  - Weekly Logging Rate: ${n.weeklyTrends ? Math.round(n.weeklyTrends.loggingRate * 100) : 'N/A'}%
  - Recent Meals: ${n.recentMeals ? n.recentMeals.slice(0, 3).map(m => `${m.date} ${m.type}: ${m.foods} (${m.calories}cal, ${m.protein}g protein)`).join('; ') : 'No recent meals logged'}`
  } else {
    // Simple nutrition data from frontend
    return `  - Protein: ${n.proteinAvg || 0}g avg / ${n.proteinTarget || 'N/A'}g target
  - Calories: ${n.calorieAvg || 0} avg / ${n.calorieTarget || 'N/A'} target
  - Tracking: ${n.tracking ? 'Yes' : 'No'}`
  }
}

function buildSystemPrompt(clients = demoClients, selectedClient = null) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  
  // Generate proactive alerts
  const alerts = generateProactiveAlerts(clients)
  const urgentAlerts = alerts.filter(a => a.priority === 'urgent')
  const moderateAlerts = alerts.filter(a => a.priority === 'moderate')
  const positiveAlerts = alerts.filter(a => a.priority === 'positive')
  
  const alertSection = `
## Proactive Alerts (Surface these proactively!)

${urgentAlerts.length > 0 ? `### Needs Immediate Attention:
${urgentAlerts.map(a => `- **${a.client}**: ${a.message}
  - Suggested: ${a.suggestedAction}
  - Draft message: "${a.template}"`).join('\n')}` : ''}

${moderateAlerts.length > 0 ? `### Worth Checking On:
${moderateAlerts.map(a => `- **${a.client}**: ${a.message}
  - Suggested: ${a.suggestedAction}`).join('\n')}` : ''}

${positiveAlerts.length > 0 ? `### Wins to Celebrate:
${positiveAlerts.map(a => `- **${a.client}**: ${a.message}
  - Suggested: ${a.suggestedAction}`).join('\n')}` : ''}`

  const clientData = clients.map(c => {
    // Handle both frontend and demo client data structures
    const workouts = c.recentWorkouts || c.sessions || []
    const workoutHistory = workouts.length > 0 ? workouts.slice(0, 3).map(formatWorkout).join('\n') : 'No recent workouts'
    const strengthData = c.strengthProgress ? Object.entries(c.strengthProgress).map(([lift, data]) => 
      `    - ${lift}: ${data.current} (${data.change} from baseline)`
    ).join('\n') : ''
    const nutritionData = formatNutrition(c.nutrition)
    
    // Handle frontend data structure (uses goals.primary) vs demo structure (uses goal)
    const goalText = c.goal || (c.goals && c.goals.primary) || 'No goal set'
    const weightInfo = c.weight 
      ? `${c.weight.current} lbs (${c.weight.change})` 
      : c.current 
        ? `${c.current.bodyweight} lbs` 
        : 'N/A'
    const statusText = c.status || 'active'
    const weekText = c.week || 'N/A'
    const streakText = c.loggingStreak ?? (c.streak ? c.streak.current : 0)
    const issueOrWin = c.issue ? `Issue: ${c.issue}` : c.win ? `Win: ${c.win}` : c.insight || ''
    const actionText = c.action || c.coachAngle || ''
    
    return `
**${c.name}** (Week ${weekText}, ${statusText})
- Goal: ${goalText}
- Program: ${c.program}
${issueOrWin ? `- ${issueOrWin}` : ''}
- Logging streak: ${streakText} days
- Weight: ${weightInfo}
- Sessions: ${c.sessionsThisWeek || 0}/${c.sessionsPerWeek || 'N/A'} this week, ${c.totalSessions || 0} total
${actionText ? `- Recommended: ${actionText}` : ''}

**Nutrition Data:**
${nutritionData}

**Strength Progress:**
${strengthData}

**Recent Workouts:**
${workoutHistory}`
  }).join('\n')

  // Include any recently logged workouts and meals
  const recentLogs = loggedWorkouts.length > 0 
    ? `\n\n## Recently Logged Workouts (via chat):\n${loggedWorkouts.map(w => 
        `- ${w.clientName}: ${w.type} on ${w.date} - ${w.exercises.map(e => `${e.name} ${e.sets}x${e.reps}@${e.weight}lbs`).join(', ')}`
      ).join('\n')}`
    : ''
    
  const recentMealLogs = loggedMeals.length > 0
    ? `\n\n## Recently Logged Meals (via chat):\n${loggedMeals.map(m =>
        `- ${m.clientName}: ${m.mealType} on ${m.date} - ${m.foods.map(f => `${f.name} (${f.calories}cal, ${f.protein}g protein)`).join(', ')}`
      ).join('\n')}`
    : ''

  return `You are Milton, an AI coaching copilot for personal trainers and fitness coaches. You have real-time access to all client data including workout history, exercise performance, nutrition tracking, and session notes.

## NORTH STAR: SESSION QUALITY
Your #1 goal is ensuring every training session is exceptional. Everything else supports this:
- **Pre-Session**: Prepare the coach with curated intel so they walk in ready
- **In-Session**: Surface progressive overload recommendations and cues
- **Post-Session**: Capture notes and observations for future sessions

Great sessions → client results → retention → business success. This is the flywheel.

## Your Personality
- Warm but efficient — like a trusted colleague who has your back
- Action-oriented — always suggest a clear next step
- Proactive — surface session-critical info without being asked
- Concise — 2-4 sentences unless asked for more detail
- Trainer-first language — speak like someone who understands the craft

## Core Capabilities
1. **Session Prep** (use getSessionPrep tool) - Pull curated intel before a session: last workout, progressive overload recommendations, client notes, flags
2. **Progressive Overload** - Analyze when to push weight/reps/sets based on RPE trends
3. **Log Workouts** - Record sessions, exercises, sets, weights, RPE
4. **Log Meals** - Track nutrition, calculate remaining macros
5. **Surface Alerts** - Identify clients needing attention (missed sessions, nutrition gaps, wins)
6. **Draft Messages** - Create personalized check-ins and follow-ups

## Priority Framework for Alerts
**#1 SESSION REBOOKING** - Clients who haven't trained recently or missed sessions
**#2 SESSION QUALITY FLAGS** - Anything that could impact the next session (injury notes, energy issues, form concerns)
**#3 ENGAGEMENT** - Clients not logging or seeming disengaged
**#4 NUTRITION** - Protein deficits, calorie issues (these support sessions)

## Session Prep Context
When asked about an upcoming session, or when the coach selects a client, use the getSessionPrep tool to provide:
- **Last Session Summary**: Key lifts, weights, RPE, any notes
- **Progressive Overload Recommendations**: What to push today based on data
- **Client Flags**: Recent notes, injury concerns, motivation level
- **Goal Context**: Where they are vs where they want to be

## Post-Session Capture
When the coach mentions a session just ended, proactively offer to:
- Log the workout details
- Capture quick notes (form observations, energy level, wins)
- Flag anything for next session (sore shoulder, needs form work, etc.)

## Message Drafting
When asked to "craft a message" or "write a message":

---
**Message for [Name]:**

"Hey [First name]! [Your personalized message based on their data]"

---

- Casual, warm, encouraging tone
- REBOOKING focus if they've missed sessions
- Include specific details from their data
- 2-3 sentences max, ready to copy/paste

## Response Rules
- ONLY reference the 5 clients listed below — never invent data
- Use specific names, numbers, and dates from the data
- When discussing sessions: reference actual exercise data with weights/reps/RPE
- When asked "who needs attention": lead with session-related needs first
- When asked about remaining macros: calculate based on logged meals vs targets
- Keep responses actionable and trainer-focused
${alertSection}

## Current Client Roster (5 clients):
${clientData}
${recentLogs}
${recentMealLogs}

## Today's Context
- Date: ${today}
- Urgent attention needed: ${urgentAlerts.map(a => a.client).join(', ') || 'None'}
- Worth checking on: ${moderateAlerts.map(a => a.client).join(', ') || 'None'}
- Wins to celebrate: ${positiveAlerts.map(a => a.client).join(', ') || 'None'}
${selectedClient ? `\n## Currently Viewing: ${selectedClient.name}
The coach is currently looking at ${selectedClient.name}'s profile. When they say "she", "he", "they", "this client", or ask questions without naming someone, they're referring to ${selectedClient.name}. Prioritize information about this client in your responses.` : ''}

Remember: Session quality is the north star. When a coach mentions a client, use getSessionPrep to surface curated intel. After sessions, capture notes for next time. Be specific, brief, and trainer-focused.`
}

// Define tools for workout and nutrition logging
const coachingTools = {
  // SESSION PREP - The most important tool for session quality
  getSessionPrep: tool({
    description: 'Get curated session prep data for a client before their training session. Use this when a coach asks about an upcoming session, selects a client, or says something like "I have [client] coming in" or "prep me for [client]". This surfaces last session data, progressive overload recommendations, and flags.',
    inputSchema: z.object({
      clientName: z.string().describe('The name of the client')
    }),
    execute: async ({ clientName }) => {
      const client = demoClients.find(c => c.name.toLowerCase() === clientName.toLowerCase())
      if (!client) {
        return { success: false, error: `Client "${clientName}" not found. Available clients: ${demoClients.map(c => c.name).join(', ')}` }
      }
      
      const lastWorkout = client.recentWorkouts && client.recentWorkouts[0] ? client.recentWorkouts[0] : null
      const secondLastWorkout = client.recentWorkouts && client.recentWorkouts[1] ? client.recentWorkouts[1] : null
      
      // Generate progressive overload recommendations based on RPE trends
      const progressiveOverloadRecs = []
      if (lastWorkout) {
        lastWorkout.exercises.forEach(ex => {
          const lastSet = ex.sets[ex.sets.length - 1]
          if (lastSet.rpe <= 7) {
            progressiveOverloadRecs.push({
              exercise: ex.name,
              recommendation: `Push weight: RPE ${lastSet.rpe} on ${lastSet.weight}lbs suggests room to add 5-10lbs`,
              lastPerformance: `${lastSet.weight}lbs x ${lastSet.reps} @ RPE ${lastSet.rpe}`
            })
          } else if (lastSet.rpe >= 8.5) {
            progressiveOverloadRecs.push({
              exercise: ex.name,
              recommendation: `Hold weight: RPE ${lastSet.rpe} indicates working near limit. Consolidate before progressing.`,
              lastPerformance: `${lastSet.weight}lbs x ${lastSet.reps} @ RPE ${lastSet.rpe}`
            })
          } else {
            progressiveOverloadRecs.push({
              exercise: ex.name,
              recommendation: `Ready for small jump: Consider +5lbs or +1 rep`,
              lastPerformance: `${lastSet.weight}lbs x ${lastSet.reps} @ RPE ${lastSet.rpe}`
            })
          }
        })
      }
      
      // Detect session-critical flags
      const flags = []
      const n = client.nutrition || {}
      
      // Session gap flag
      const daysSinceLastSession = lastWorkout 
        ? Math.floor((new Date() - new Date(lastWorkout.date)) / (1000 * 60 * 60 * 24))
        : null
      if (daysSinceLastSession && daysSinceLastSession > 5) {
        flags.push({ type: 'warning', message: `${daysSinceLastSession} days since last session - may need lighter start` })
      }
      
      // Nutrition flag
      if (n.daysLowProtein >= 3 || n.calorieAvg < n.calorieTarget * 0.8) {
        flags.push({ type: 'warning', message: `Under-fueled: ${n.proteinAvg}g protein avg (target: ${n.proteinTarget}g). May affect performance.` })
      }
      
      // Form/injury notes from last session
      if (lastWorkout && lastWorkout.notes) {
        if (lastWorkout.notes.toLowerCase().includes('form') || 
            lastWorkout.notes.toLowerCase().includes('pain') ||
            lastWorkout.notes.toLowerCase().includes('tight') ||
            lastWorkout.notes.toLowerCase().includes('heavy')) {
          flags.push({ type: 'note', message: `Last session note: "${lastWorkout.notes}"` })
        }
      }
      
// Positive momentum
  if (n.proteinStreak >= 5) {
  flags.push({ type: 'positive', message: `${n.proteinStreak}-day protein streak - fueling well!` })
  }
  if (client.loggingStreak >= 7) {
  flags.push({ type: 'positive', message: `${client.loggingStreak}-day logging streak - highly engaged` })
  }
  
  // Include most recent trainer note as context
  if (client.trainerNotes && client.trainerNotes.length > 0) {
    const latestNote = client.trainerNotes[0]
    flags.push({ type: 'coach-note', message: `Your note (${latestNote.date}): ${latestNote.note}` })
  }
  
  return {
        success: true,
        client: client.name,
        goal: client.goal,
        program: client.program,
        week: client.week,
        status: client.status,
        
        // Last session summary
        lastSession: lastWorkout ? {
          date: lastWorkout.date,
          daysSince: daysSinceLastSession,
          type: lastWorkout.type,
          duration: lastWorkout.duration,
          keyLifts: lastWorkout.exercises.map(ex => {
            const topSet = ex.sets.reduce((best, s) => s.weight > best.weight ? s : best, ex.sets[0])
            return `${ex.name}: ${topSet.weight}lbs x ${topSet.reps} @ RPE ${topSet.rpe}`
          }),
          notes: lastWorkout.notes
        } : null,
        
        // Progressive overload recommendations
        progressiveOverload: progressiveOverloadRecs,
        
        // Flags and alerts
        flags,
        
// Quick context
  sessionsThisWeek: client.sessionsThisWeek,
  sessionsPerWeek: client.sessionsPerWeek,
  totalSessions: client.totalSessions,
  strengthProgress: client.strengthProgress,
  
  // Trainer notes from previous sessions
  trainerNotes: client.trainerNotes ? client.trainerNotes.slice(0, 3) : [],
  
  // Nutrition snapshot (affects session performance)
        nutritionSnapshot: {
          proteinAvg: n.proteinAvg,
          proteinTarget: n.proteinTarget,
          calorieAvg: n.calorieAvg,
          calorieTarget: n.calorieTarget,
          streak: n.proteinStreak || 0
        }
      }
    }
  }),
  
  // POST-SESSION NOTES - Capture quick observations
  captureSessionNotes: tool({
    description: 'Capture quick notes after a training session. Use this when the coach wants to record observations, form notes, or flags for next session.',
    inputSchema: z.object({
      clientName: z.string().describe('The name of the client'),
      sessionType: z.string().describe('Type of session (e.g., "Upper Body", "Legs", "Pull")'),
      energyLevel: z.enum(['low', 'moderate', 'high']).describe('Client energy level during session'),
      wins: z.string().nullable().describe('What went well (PRs, form improvements, attitude)'),
      formNotes: z.string().nullable().describe('Any form observations or corrections made'),
      flagsForNextSession: z.string().nullable().describe('Things to watch or address next session'),
      overallRPE: z.number().describe('Overall session RPE (1-10)')
    }),
    execute: async ({ clientName, sessionType, energyLevel, wins, formNotes, flagsForNextSession, overallRPE }) => {
      const client = demoClients.find(c => c.name.toLowerCase() === clientName.toLowerCase())
      if (!client) {
        return { success: false, error: `Client "${clientName}" not found.` }
      }
      
      const sessionNote = {
        clientName: client.name,
        date: new Date().toISOString().split('T')[0],
        sessionType,
        energyLevel,
        wins: wins || '',
        formNotes: formNotes || '',
        flagsForNextSession: flagsForNextSession || '',
        overallRPE,
        capturedAt: new Date().toISOString()
      }
      
      // Store in memory (in production, this would go to database)
      if (!client.sessionNotes) client.sessionNotes = []
      client.sessionNotes.push(sessionNote)
      
      return {
        success: true,
        message: `Session notes captured for ${client.name}`,
        summary: {
          session: sessionType,
          energy: energyLevel,
          rpe: overallRPE,
          wins: wins || 'None noted',
          flags: flagsForNextSession || 'None'
        },
        nextSessionReminder: flagsForNextSession ? `Remember next session: ${flagsForNextSession}` : null
      }
    }
  }),
  
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
      const client = demoClients.find(c => c.name.toLowerCase() === clientName.toLowerCase())
      if (!client) {
        return { success: false, error: `Client "${clientName}" not found. Available clients: ${demoClients.map(c => c.name).join(', ')}` }
      }
      
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
      
      const existingToday = loggedWorkouts.find(w => w.clientName === client.name && w.date === today)
      if (existingToday) {
        existingToday.exercises.push(exercise)
        return { 
          success: true, 
          message: `Added ${exerciseName} to ${client.name}'s workout today`,
          exercise: `${sets}x${reps} @ ${weight}lbs${rpe ? ` (RPE ${rpe})` : ''}`
        }
      }
      
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
  }),
  
  // NEW NUTRITION TOOLS
  logMeal: tool({
    description: 'Log a meal for a client. Use this when the coach wants to record a meal, food, or nutrition entry.',
    inputSchema: z.object({
      clientName: z.string().describe('The name of the client'),
      mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).describe('Type of meal'),
      foods: z.array(z.object({
        name: z.string().describe('Name/description of the food'),
        calories: z.number().describe('Calories'),
        protein: z.number().describe('Protein in grams'),
        carbs: z.number().describe('Carbohydrates in grams'),
        fat: z.number().describe('Fat in grams')
      })).describe('List of foods in the meal'),
      date: z.string().optional().describe('Date in YYYY-MM-DD format (defaults to today)')
    }),
    execute: async ({ clientName, mealType, foods, date }) => {
      const client = demoClients.find(c => c.name.toLowerCase() === clientName.toLowerCase())
      if (!client) {
        return { success: false, error: `Client "${clientName}" not found. Available clients: ${demoClients.map(c => c.name).join(', ')}` }
      }
      
      const mealDate = date || new Date().toISOString().split('T')[0]
      const totalCals = foods.reduce((sum, f) => sum + f.calories, 0)
      const totalProtein = foods.reduce((sum, f) => sum + f.protein, 0)
      const totalCarbs = foods.reduce((sum, f) => sum + f.carbs, 0)
      const totalFat = foods.reduce((sum, f) => sum + f.fat, 0)
      
      const meal = {
        clientName: client.name,
        mealType,
        foods,
        date: mealDate,
        totals: { calories: totalCals, protein: totalProtein, carbs: totalCarbs, fat: totalFat },
        loggedAt: new Date().toISOString()
      }
      loggedMeals.push(meal)
      
      // Calculate remaining macros for the day
      const todayMeals = loggedMeals.filter(m => m.clientName === client.name && m.date === mealDate)
      const dayTotals = {
        calories: todayMeals.reduce((sum, m) => sum + m.totals.calories, 0),
        protein: todayMeals.reduce((sum, m) => sum + m.totals.protein, 0),
        carbs: todayMeals.reduce((sum, m) => sum + m.totals.carbs, 0),
        fat: todayMeals.reduce((sum, m) => sum + m.totals.fat, 0)
      }
      
      const remaining = {
        calories: client.nutrition.calorieTarget - dayTotals.calories,
        protein: client.nutrition.proteinTarget - dayTotals.protein,
        carbs: client.nutrition.carbsTarget - dayTotals.carbs,
        fat: client.nutrition.fatTarget - dayTotals.fat
      }
      
      return {
        success: true,
        message: `Logged ${mealType} for ${client.name}`,
        mealTotals: { calories: totalCals, protein: totalProtein, carbs: totalCarbs, fat: totalFat },
        dayTotals,
        remaining,
        targets: {
          calories: client.nutrition.calorieTarget,
          protein: client.nutrition.proteinTarget,
          carbs: client.nutrition.carbsTarget,
          fat: client.nutrition.fatTarget
        }
      }
    }
  }),
  
  analyzeNutrition: tool({
    description: 'Analyze nutrition trends and patterns for a client over a time period',
    inputSchema: z.object({
      clientName: z.string().describe('The name of the client'),
      period: z.enum(['today', 'week', 'month']).describe('Time period to analyze')
    }),
    execute: async ({ clientName, period }) => {
      const client = demoClients.find(c => c.name.toLowerCase() === clientName.toLowerCase())
      if (!client) {
        return { success: false, error: `Client "${clientName}" not found.` }
      }
      
      const n = client.nutrition
      const logged = loggedMeals.filter(m => m.clientName === client.name)
      
      // Calculate protein deficit percentage
      const proteinDeficitPercent = Math.round((1 - n.proteinAvg / n.proteinTarget) * 100)
      const calorieDeficitPercent = Math.round((1 - n.calorieAvg / n.calorieTarget) * 100)
      
      // Identify patterns
      const patterns = []
      if (n.proteinAvg < n.proteinTarget * 0.8) {
        patterns.push(`Protein consistently ${proteinDeficitPercent}% below target for ${n.daysLowProtein} days`)
      }
      if (n.calorieAvg < n.calorieTarget * 0.85) {
        patterns.push(`Calories running ${calorieDeficitPercent}% below target`)
      }
      if (n.proteinStreak >= 3) {
        patterns.push(`On a ${n.proteinStreak}-day protein streak!`)
      }
      if (n.mealLoggingStreak >= 7) {
        patterns.push(`Excellent logging consistency: ${n.mealLoggingStreak} days straight`)
      }
      if (n.weeklyTrends.loggingRate < 0.6) {
        patterns.push(`Low logging rate (${Math.round(n.weeklyTrends.loggingRate * 100)}%) - may need simpler tracking`)
      }
      
      return {
        success: true,
        client: client.name,
        period,
        targets: {
          protein: n.proteinTarget,
          calories: n.calorieTarget,
          carbs: n.carbsTarget,
          fat: n.fatTarget
        },
        averages: {
          protein: n.proteinAvg,
          calories: n.calorieAvg,
          carbs: n.carbsAvg,
          fat: n.fatAvg
        },
        adherence: {
          proteinPercent: Math.round(n.proteinAvg / n.proteinTarget * 100),
          caloriePercent: Math.round(n.calorieAvg / n.calorieTarget * 100),
          loggingRate: `${Math.round(n.weeklyTrends.loggingRate * 100)}%`
        },
        streaks: {
          protein: n.proteinStreak,
          mealLogging: n.mealLoggingStreak
        },
        patterns,
        recentMeals: n.recentMeals,
        newlyLoggedMeals: logged
      }
    }
  }),
  
  getRemainingMacros: tool({
    description: 'Calculate remaining macros for a client for the current day',
    inputSchema: z.object({
      clientName: z.string().describe('The name of the client')
    }),
    execute: async ({ clientName }) => {
      const client = demoClients.find(c => c.name.toLowerCase() === clientName.toLowerCase())
      if (!client) {
        return { success: false, error: `Client "${clientName}" not found.` }
      }
      
      const today = new Date().toISOString().split('T')[0]
      const todayMeals = loggedMeals.filter(m => m.clientName === client.name && m.date === today)
      
      // Include meals from demo data for today
      const demoTodayMeals = client.nutrition.recentMeals.filter(m => m.date === '2026-03-21') // Use the demo "today"
      
      const loggedTotals = {
        calories: todayMeals.reduce((sum, m) => sum + m.totals.calories, 0),
        protein: todayMeals.reduce((sum, m) => sum + m.totals.protein, 0),
        carbs: todayMeals.reduce((sum, m) => sum + m.totals.carbs, 0),
        fat: todayMeals.reduce((sum, m) => sum + m.totals.fat, 0)
      }
      
      const demoTotals = {
        calories: demoTodayMeals.reduce((sum, m) => sum + m.calories, 0),
        protein: demoTodayMeals.reduce((sum, m) => sum + m.protein, 0),
        carbs: demoTodayMeals.reduce((sum, m) => sum + m.carbs, 0),
        fat: demoTodayMeals.reduce((sum, m) => sum + m.fat, 0)
      }
      
      const consumed = {
        calories: loggedTotals.calories + demoTotals.calories,
        protein: loggedTotals.protein + demoTotals.protein,
        carbs: loggedTotals.carbs + demoTotals.carbs,
        fat: loggedTotals.fat + demoTotals.fat
      }
      
      const remaining = {
        calories: client.nutrition.calorieTarget - consumed.calories,
        protein: client.nutrition.proteinTarget - consumed.protein,
        carbs: client.nutrition.carbsTarget - consumed.carbs,
        fat: client.nutrition.fatTarget - consumed.fat
      }
      
      // Suggest meal ideas based on remaining macros
      let suggestions = []
      if (remaining.protein > 30) {
        suggestions.push('High-protein options: Greek yogurt, chicken breast, protein shake, eggs, cottage cheese')
      }
      if (remaining.calories > 400 && remaining.protein > 20) {
        suggestions.push('Balanced meal ideas: Grilled salmon with vegetables, chicken stir-fry, beef and rice bowl')
      }
      if (remaining.calories < 300 && remaining.protein > 20) {
        suggestions.push('Low-cal high-protein: Egg whites, lean deli turkey, protein shake with water, shrimp')
      }
      
      return {
        success: true,
        client: client.name,
        targets: {
          calories: client.nutrition.calorieTarget,
          protein: client.nutrition.proteinTarget,
          carbs: client.nutrition.carbsTarget,
          fat: client.nutrition.fatTarget
        },
        consumed,
        remaining,
        mealsLoggedToday: todayMeals.length + demoTodayMeals.length,
        suggestions
      }
    }
  }),
  
  suggestFollowUp: tool({
    description: 'Get a suggested follow-up message for a client based on their current status',
    inputSchema: z.object({
      clientName: z.string().describe('The name of the client'),
      focusArea: z.enum(['nutrition', 'workouts', 'general', 'celebration']).optional().describe('What to focus the message on')
    }),
    execute: async ({ clientName, focusArea }) => {
      const client = demoClients.find(c => c.name.toLowerCase() === clientName.toLowerCase())
      if (!client) {
        return { success: false, error: `Client "${clientName}" not found.` }
      }
      
      const n = client.nutrition
      const messages = []
      
      // Generate appropriate messages based on client status
      // PRIORITY #1: REBOOKING - Check for missed sessions FIRST
      const lastWorkoutDate = client.recentWorkouts && client.recentWorkouts[0] 
        ? client.recentWorkouts[0].date 
        : null
      
      if (focusArea === 'workouts' || client.sessionsThisWeek === 0 || client.sessionsThisWeek < client.sessionsPerWeek) {
        // Determine urgency level
        const missedSessions = client.sessionsPerWeek - (client.sessionsThisWeek || 0)
        if (missedSessions >= 2) {
          messages.push({
            type: 'rebooking_urgent',
            priority: 1,
            message: messageTemplates.rebookUrgent(client.name, 5)
          })
        } else if (client.sessionsThisWeek === 0) {
          messages.push({
            type: 'rebooking',
            priority: 1,
            message: messageTemplates.rebookSession(client.name, missedSessions, lastWorkoutDate)
          })
        } else {
          messages.push({
            type: 'gentle_checkin',
            priority: 2,
            message: messageTemplates.rebookGentle(client.name)
          })
        }
      }
      
      // PRIORITY #2: Nutrition concerns
      if (focusArea === 'nutrition' || (n && n.daysLowProtein >= 3)) {
        messages.push({
          type: 'nutrition_concern',
          priority: 3,
          message: messageTemplates.lowProtein(client.name, n.proteinAvg, n.proteinTarget, n.daysLowProtein)
        })
      }
      
      // PRIORITY #3: Celebrations (good for engagement)
      if (focusArea === 'celebration' || (n && n.proteinStreak >= 5)) {
        messages.push({
          type: 'celebration',
          priority: 4,
          message: messageTemplates.proteinStreak(client.name, n.proteinStreak)
        })
      }
      
      if (focusArea === 'celebration' || (n && n.mealLoggingStreak >= 7)) {
        messages.push({
          type: 'celebration',
          priority: 4,
          message: messageTemplates.mealLoggingStreak(client.name, n.mealLoggingStreak)
        })
      }
      
      if (client.weight.trend === 'plateau') {
        messages.push({
          type: 'plateau',
          message: messageTemplates.weightPlateau(client.name, 14)
        })
      }
      
      if (client.status === 'new-client') {
        messages.push({
          type: 'new_client',
          message: messageTemplates.newClientEncouragement(client.name, client.week)
        })
      }
      
      // Sort by priority
      messages.sort((a, b) => (a.priority || 99) - (b.priority || 99))
      
      return {
        success: true,
        client: client.name,
        status: client.status,
        suggestedMessages: messages,
        context: {
          proteinStatus: n ? `${n.proteinAvg}g avg vs ${n.proteinTarget}g target` : 'No nutrition data',
          workoutStatus: `${client.sessionsThisWeek || 0}/${client.sessionsPerWeek || 'N/A'} sessions this week`,
          streaks: n ? { protein: n.proteinStreak, logging: n.mealLoggingStreak } : null,
          weightTrend: client.weight ? client.weight.change : 'N/A'
        }
      }
    }
  }),
  
  // Dedicated tool for crafting messages - makes it explicit
  craftMessage: tool({
    description: 'Craft a personalized follow-up message for a client. Use this when the coach says "craft a message", "write a message", "draft a message" for any client. Returns a ready-to-send message.',
    inputSchema: z.object({
      clientName: z.string().describe('The name of the client'),
      purpose: z.enum(['rebooking', 'nutrition', 'celebration', 'check-in', 'general']).describe('The purpose of the message - rebooking is highest priority for missed sessions')
    }),
    execute: async ({ clientName, purpose }) => {
      const client = demoClients.find(c => c.name.toLowerCase() === clientName.toLowerCase())
      if (!client) {
        return { success: false, error: `Client "${clientName}" not found. Available clients: ${demoClients.map(c => c.name).join(', ')}` }
      }
      
      const n = client.nutrition || {}
      const firstName = client.name.split(' ')[0]
      const lastWorkout = client.recentWorkouts && client.recentWorkouts[0] ? client.recentWorkouts[0].date : null
      const missedSessions = (client.sessionsPerWeek || 0) - (client.sessionsThisWeek || 0)
      
      let message = ''
      let messagePurpose = purpose
      
      // Auto-detect if rebooking should be the focus (override if needed)
      if (client.sessionsThisWeek === 0 || missedSessions >= 2) {
        messagePurpose = 'rebooking'
      }
      
      switch (messagePurpose) {
        case 'rebooking':
          if (missedSessions >= 2) {
            message = messageTemplates.rebookUrgent(client.name, 5)
          } else if (client.sessionsThisWeek === 0) {
            message = messageTemplates.rebookSession(client.name, missedSessions, lastWorkout)
          } else {
            message = messageTemplates.rebookGentle(client.name)
          }
          break
        case 'nutrition':
          if (n.daysLowProtein >= 3) {
            message = messageTemplates.lowProtein(client.name, n.proteinAvg, n.proteinTarget, n.daysLowProtein)
          } else if (n.calorieAvg && n.calorieTarget && n.calorieAvg < n.calorieTarget * 0.85) {
            message = messageTemplates.lowCalories(client.name, n.calorieAvg, n.calorieTarget)
          } else {
            message = `Hey ${firstName}! Just wanted to check in on your nutrition - how's meal prep going this week? Let me know if you need any quick recipe ideas.`
          }
          break
        case 'celebration':
          if (n.proteinStreak >= 5) {
            message = messageTemplates.proteinStreak(client.name, n.proteinStreak)
          } else if (n.mealLoggingStreak >= 7) {
            message = messageTemplates.mealLoggingStreak(client.name, n.mealLoggingStreak)
          } else {
            message = `Hey ${firstName}! Just wanted to say you've been doing great - keep up the awesome work!`
          }
          break
        case 'check-in':
          if (client.status === 'new-client') {
            message = messageTemplates.newClientEncouragement(client.name, client.week)
          } else {
            message = `Hey ${firstName}! How's everything going? Wanted to check in and see how you're feeling about your progress lately.`
          }
          break
        default:
          // General - pick the most relevant message
          if (missedSessions >= 1 || client.sessionsThisWeek === 0) {
            message = messageTemplates.rebookSession(client.name, missedSessions, lastWorkout)
          } else if (n.daysLowProtein >= 3) {
            message = messageTemplates.lowProtein(client.name, n.proteinAvg, n.proteinTarget, n.daysLowProtein)
          } else {
            message = `Hey ${firstName}! Quick check-in - how's everything going? Let me know if there's anything you need.`
          }
      }
      
      return {
        success: true,
        client: client.name,
        purpose: messagePurpose,
        message: message,
        context: {
          sessionsThisWeek: `${client.sessionsThisWeek || 0}/${client.sessionsPerWeek || 'N/A'}`,
          lastWorkout: lastWorkout || 'No recent workouts',
          nutritionStatus: n.proteinAvg ? `${n.proteinAvg}g protein avg` : 'No nutrition data'
        }
      }
    }
  })
}

// Vercel Serverless Function handler
export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(200).end()
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  try {
    const { messages, clients, selectedClientIndex } = req.body
    
    // Merge frontend client data with demo data for nutrition context
    const clientsToUse = clients && clients.length > 0 
      ? clients.map(c => {
          // Find matching demo client to get nutrition data
          const demoMatch = demoClients.find(d => d.name === c.name)
          return demoMatch ? { ...demoMatch, ...c, nutrition: demoMatch.nutrition } : c
        })
      : demoClients
    
    const selectedClient = selectedClientIndex !== null && selectedClientIndex !== undefined && clientsToUse[selectedClientIndex]
      ? clientsToUse[selectedClientIndex]
      : null
    
    const systemPrompt = buildSystemPrompt(clientsToUse, selectedClient)

    const result = await streamText({
      model: 'anthropic/claude-sonnet-4-20250514',
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.type === "user" ? "user" : "assistant",
        content: m.text || "",
      })),
      tools: coachingTools,
      maxSteps: 5,
    })

    let fullText = ''
    for await (const chunk of result.textStream) {
      fullText += chunk
    }

    return res.status(200).json({ text: fullText })
  } catch (error) {
    console.error('[v0] Chat API error:', error)
    return res.status(500).json({ 
      error: 'Failed to generate response', 
      details: error.message,
      name: error.name,
      cause: error.cause ? String(error.cause) : undefined
    })
  }
}
