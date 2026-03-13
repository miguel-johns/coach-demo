// Demo client dataset for Milton AI coaching assistant
export const demoClients = [
  {
    name: "Sarah Chen",
    goal: "Lose 15 lbs for wedding in 3 months",
    engagementStatus: "at-risk",
    recentIssue: "Missed logging for 4 days straight — longest gap since starting",
    recentWin: null,
    recommendedAction: "Send a supportive check-in message asking about her week and offering to simplify her logging routine",
    metrics: {
      loggingStreak: 0,
      avgCalories: 1420,
      proteinAvg: 95,
      proteinTarget: 120,
      weightTrend: "up 1.2 lbs this week",
      programWeek: 6
    }
  },
  {
    name: "Marcus Johnson",
    goal: "Build muscle, gain 10 lbs lean mass",
    engagementStatus: "highly-engaged",
    recentIssue: null,
    recentWin: "Hit protein goal 7 days straight — new personal record",
    recommendedAction: "Celebrate his streak and suggest progressing to a higher calorie target",
    metrics: {
      loggingStreak: 14,
      avgCalories: 2850,
      proteinAvg: 185,
      proteinTarget: 180,
      weightTrend: "up 0.8 lbs this week (on track)",
      programWeek: 8
    }
  },
  {
    name: "Emily Rodriguez",
    goal: "Improve energy and relationship with food",
    engagementStatus: "moderate",
    recentIssue: "Calories very low on weekdays (under 1200), then spikes on weekends",
    recentWin: "Opened up about stress eating patterns in last check-in",
    recommendedAction: "Schedule a call to discuss sustainable weekday eating and stress management strategies",
    metrics: {
      loggingStreak: 5,
      avgCalories: 1380,
      proteinAvg: 68,
      proteinTarget: 100,
      weightTrend: "fluctuating ±2 lbs",
      programWeek: 4
    }
  },
  {
    name: "David Park",
    goal: "Drop from 22% to 15% body fat",
    engagementStatus: "highly-engaged",
    recentIssue: "Plateau for 2 weeks despite good adherence",
    recentWin: "Perfect logging for 21 days straight",
    recommendedAction: "Review his macros and consider a small calorie adjustment or diet break",
    metrics: {
      loggingStreak: 21,
      avgCalories: 1950,
      proteinAvg: 165,
      proteinTarget: 160,
      weightTrend: "flat for 14 days",
      programWeek: 10
    }
  },
  {
    name: "Rachel Kim",
    goal: "Post-pregnancy fitness and strength",
    engagementStatus: "new-client",
    recentIssue: "Struggling to find time to log with newborn",
    recentWin: "Completed her first full week of workouts since giving birth",
    recommendedAction: "Send encouragement about her workout milestone and offer quick-log meal templates",
    metrics: {
      loggingStreak: 2,
      avgCalories: 1680,
      proteinAvg: 85,
      proteinTarget: 110,
      weightTrend: "down 0.5 lbs (healthy pace)",
      programWeek: 2
    }
  }
];

export const coachingContext = {
  coachName: "Coach",
  todayDate: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
  totalActiveClients: 5,
  clientsNeedingAttention: ["Sarah Chen", "Emily Rodriguez"],
  clientsDoingWell: ["Marcus Johnson", "David Park"],
  newClients: ["Rachel Kim"]
};

// Helper to format client data for the AI
export function formatClientDataForAI() {
  return demoClients.map(c => `
**${c.name}**
- Goal: ${c.goal}
- Status: ${c.engagementStatus}
- ${c.recentIssue ? `Issue: ${c.recentIssue}` : `Win: ${c.recentWin}`}
- Recommended action: ${c.recommendedAction}
- Logging streak: ${c.metrics.loggingStreak} days
- Protein: ${c.metrics.proteinAvg}g avg (target: ${c.metrics.proteinTarget}g)
- Weight trend: ${c.metrics.weightTrend}
- Program week: ${c.metrics.programWeek}
`).join('\n');
}
