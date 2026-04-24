export interface HealthData {
  // Demographics
  age: number;
  sex: 'male' | 'female' | 'other';

  // Biometrics
  height: number; // cm
  weight: number; // kg
  bmi?: number;

  // Lifestyle
  smokingStatus: 'never' | 'former' | 'current';
  alcoholDrinksPerWeek: number;
  exerciseDaysPerWeek: number;
  exerciseMinutesPerSession: number;
  sleepHoursPerNight: number;

  // Diet
  dietQuality: 1 | 2 | 3 | 4 | 5; // 1=poor, 5=excellent
  fruitVegServingsPerDay: number;

  // Mental health
  stressLevel: 1 | 2 | 3 | 4 | 5; // 1=low, 5=high
  socialConnections: 1 | 2 | 3 | 4 | 5; // 1=isolated, 5=very connected

  // Medical
  hasHypertension: boolean;
  hasDiabetes: boolean;
  hasHeartDisease: boolean;

  // Wearable data (optional)
  avgDailySteps?: number;
  avgRestingHeartRate?: number;
  avgHRV?: number;
}

export interface TrajectoryPoint {
  year: number;
  age: number;
  biologicalAge: number;
  healthScore: number;
}

export interface Trajectory {
  id: 'current' | 'optimized' | 'decline';
  label: string;
  color: string;
  description: string;
  points: TrajectoryPoint[];
  biologicalAgeAt30Years: number;
  keyChanges: string[];
}

export interface SimulationResult {
  currentBiologicalAge: number;
  chronologicalAge: number;
  agingRate: number; // years per year
  trajectories: Trajectory[];
  topHabitChange: {
    habit: string;
    impact: string;
    description: string;
    potentialYearsGained: number;
  };
}

export interface AppState {
  healthData: Partial<HealthData>;
  simulation: SimulationResult | null;
  currentScreen: Screen;
  userEmail: string;
  letterSent: boolean;
}

export type Screen =
  | 'welcome'
  | 'questionnaire'
  | 'processing'
  | 'dashboard'
  | 'letter'
  | 'chat'
  | 'email';
