import type { Client, Session, DayActivity, ProfileData, DailyMetrics } from "./types";

export const mockClient: Client = {
  id: "1",
  name: "Sarah Mitchell",
  avatar: "/placeholder.svg?height=80&width=80",
  program: "Strength & Conditioning",
  streak: 12,
  sessionsThisWeek: 2,
  targetSessionsPerWeek: 3,
  totalSessions: 14,
  lastSessionType: "Upper Body",
  lastSessionDate: "Mar 23",
  goalDescription: "Lose 20 lbs",
  goalProgress: 25,
  startWeight: 173,
  currentWeight: 168,
  goalWeight: 153,
};

export const mockSessions: Session[] = [
  {
    id: "1",
    day: "Today",
    date: "Mar 25",
    type: "Lower Body",
    time: "10:00 AM",
    isToday: true,
  },
  {
    id: "2",
    day: "Thursday",
    date: "Mar 27",
    type: "Upper Body",
    time: "10:00 AM",
    isToday: false,
  },
  {
    id: "3",
    day: "Saturday",
    date: "Mar 29",
    type: "Full Body",
    time: "9:00 AM",
    isToday: false,
  },
];

// Generate 35 days of activity data (5 weeks)
export const generateActivityData = (): DayActivity[] => {
  const data: DayActivity[] = [];
  const today = new Date();
  
  for (let i = 34; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const workout = Math.random() > 0.4;
    const nutrition = Math.random() > 0.3;
    const sleep = Math.random() > 0.2;
    const steps = Math.random() > 0.25;
    
    data.push({
      date: date.toISOString().split("T")[0],
      workout,
      nutrition,
      sleep,
      steps,
      categoriesLogged: [workout, nutrition, sleep, steps].filter(Boolean).length,
    });
  }
  
  return data;
};

export const mockActivityData = generateActivityData();

export const mockProfile: ProfileData = {
  weight: 168,
  goalWeight: 153,
  bodyFat: 25.2,
  leanMass: 125.6,
  height: "5'6\"",
  trainingStyle: "Barbell-focused",
  experience: "Intermediate",
  sessionsPerWeek: 3,
  preferredTime: "Morning",
  communication: "Text preferred",
  strengthBaselines: [
    { exercise: "Back Squat", previous: "95×8", current: "120×6" },
    { exercise: "Bench Press", previous: "65×8", current: "85×6" },
    { exercise: "Deadlift", previous: "135×5", current: "165×5" },
    { exercise: "OHP", previous: "45×8", current: "55×8" },
  ],
  coachNotes: "Sarah responds well to progressive overload. Focus on hip mobility before squat sessions. She mentioned knee discomfort during lunges — substitute with step-ups for now. Great attitude and consistency!",
};

export const mockDailyMetrics: Record<string, DailyMetrics> = {
  today: {
    nutrition: {
      calories: 1850,
      caloriesGoal: 1800,
      protein: 142,
      proteinGoal: 140,
      carbs: 165,
      fat: 62,
      fiber: 28,
      water: 72,
    },
    activity: {
      steps: 8432,
      stepsGoal: 10000,
      activeMinutes: 45,
      activeMinutesGoal: 45,
      caloriesBurned: 2150,
      workouts: 1,
      distance: 3.8,
      floors: 8,
    },
    sleep: {
      duration: 7.2,
      durationGoal: 7.5,
      quality: 82,
      qualityGoal: 85,
      deepSleep: 1.8,
      remSleep: 1.5,
      awakenings: 2,
      efficiency: 89,
    },
  },
  "7days": {
    nutrition: {
      calories: 1780,
      caloriesGoal: 1800,
      protein: 138,
      proteinGoal: 140,
      carbs: 158,
      fat: 58,
      fiber: 26,
      water: 68,
    },
    activity: {
      steps: 9150,
      stepsGoal: 10000,
      activeMinutes: 42,
      activeMinutesGoal: 45,
      caloriesBurned: 2080,
      workouts: 3,
      distance: 4.1,
      floors: 10,
    },
    sleep: {
      duration: 7.4,
      durationGoal: 7.5,
      quality: 78,
      qualityGoal: 85,
      deepSleep: 1.6,
      remSleep: 1.4,
      awakenings: 3,
      efficiency: 86,
    },
  },
  "30days": {
    nutrition: {
      calories: 1820,
      caloriesGoal: 1800,
      protein: 135,
      proteinGoal: 140,
      carbs: 162,
      fat: 61,
      fiber: 25,
      water: 65,
    },
    activity: {
      steps: 8800,
      stepsGoal: 10000,
      activeMinutes: 38,
      activeMinutesGoal: 45,
      caloriesBurned: 2020,
      workouts: 12,
      distance: 3.9,
      floors: 9,
    },
    sleep: {
      duration: 7.1,
      durationGoal: 7.5,
      quality: 76,
      qualityGoal: 85,
      deepSleep: 1.5,
      remSleep: 1.3,
      awakenings: 3,
      efficiency: 84,
    },
  },
};
