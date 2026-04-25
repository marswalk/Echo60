export interface HealthProfile {
  age: number;
  sleepHours: number;
  exerciseFrequency: number; // days per week
  dietQuality: number; // scale 1-10 (10 is best)
  stressLevel: number; // scale 1-10 (10 is highest stress)
  // HealthKit data
  stepCount?: number;
  activeEnergyBurned?: number;
  restingHeartRate?: number;
}

export interface TrajectoryDataPoint {
  age: number;
  healthScore: number; // 0-100 scale representing overall vitality
}

export interface Trajectory {
  type: "optimistic" | "current" | "pessimistic";
  label: string;
  data: TrajectoryDataPoint[];
  finalBiologicalAge: number;
}

export interface Letter {
  id: string;
  type: "current" | "optimized";
  subject: string;
  body: string;
  generatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  sleep: number;       // hours
  heartRate: number;   // bpm
  activity: number;    // km
  calories: number;    // kcal
  hrv: number;         // ms
  hydration: number;   // L
}

export interface HistoricalEcho60 {
  date: string; // YYYY-MM-DD
  age: number;
}

export interface Profile {
  id: string;
  name: string;
  age: number;
  bioAge: number;
  emoji: string;
  tagline: string;
  data: DailyEntry[];
  historicalEcho60: HistoricalEcho60[]; // Track trend over time
}
