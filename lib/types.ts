export interface Client {
  id: string;
  name: string;
  avatar: string;
  program: string;
  streak: number;
  sessionsThisWeek: number;
  targetSessionsPerWeek: number;
  totalSessions: number;
  lastSessionType: string;
  lastSessionDate: string;
  goalDescription: string;
  goalProgress: number;
  startWeight: number;
  currentWeight: number;
  goalWeight: number;
}

export interface Session {
  id: string;
  day: string;
  date: string;
  type: string;
  time: string;
  isToday: boolean;
}

export interface DayActivity {
  date: string;
  workout: boolean;
  nutrition: boolean;
  sleep: boolean;
  steps: boolean;
  categoriesLogged: number;
}

export interface ProfileData {
  weight: number;
  goalWeight: number;
  bodyFat: number;
  leanMass: number;
  height: string;
  trainingStyle: string;
  experience: string;
  sessionsPerWeek: number;
  preferredTime: string;
  communication: string;
  strengthBaselines: {
    exercise: string;
    previous: string;
    current: string;
  }[];
  coachNotes: string;
}

export interface DailyMetrics {
  nutrition: {
    calories: number;
    caloriesGoal: number;
    protein: number;
    proteinGoal: number;
    carbs: number;
    fat: number;
    fiber: number;
    water: number;
  };
  activity: {
    steps: number;
    stepsGoal: number;
    activeMinutes: number;
    activeMinutesGoal: number;
    caloriesBurned: number;
    workouts: number;
    distance: number;
    floors: number;
  };
  sleep: {
    duration: number;
    durationGoal: number;
    quality: number;
    qualityGoal: number;
    deepSleep: number;
    remSleep: number;
    awakenings: number;
    efficiency: number;
  };
}

export type TimePeriod = "today" | "7days" | "30days";
