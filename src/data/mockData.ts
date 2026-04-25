export interface DailyEntry {
  date: string;
  sleep: number;       // hours
  heartRate: number;   // bpm
  activity: number;    // km
  calories: number;    // kcal
  hrv: number;         // ms
  hydration: number;   // L
}

export interface MockProfile {
  id: string;
  name: string;
  age: number;
  bioAge: number;
  emoji: string;
  tagline: string;
  data: DailyEntry[];
}

// Deterministic noise: produces values between -1 and 1
function noise(i: number, seed: number): number {
  return Math.sin(i * 0.41 + seed) * 0.6 + Math.sin(i * 1.13 + seed * 1.7) * 0.4;
}

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val));
}

function round1(val: number) { return Math.round(val * 10) / 10; }

function generateDays(days: number, config: {
  sleep:     [number, number]; // [base, variation]
  heartRate: [number, number];
  activity:  [number, number];
  calories:  [number, number];
  hrv:       [number, number];
  hydration: [number, number];
}): DailyEntry[] {
  const entries: DailyEntry[] = [];
  const base = new Date('2026-04-25');

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    entries.push({
      date: dateStr,
      sleep:     round1(clamp(config.sleep[0]     + noise(i, 1.1) * config.sleep[1],     3, 12)),
      heartRate: Math.round(clamp(config.heartRate[0] + noise(i, 2.3) * config.heartRate[1], 40, 130)),
      activity:  round1(clamp(config.activity[0]  + noise(i, 3.7) * config.activity[1],  0, 25)),
      calories:  Math.round(clamp(config.calories[0] + noise(i, 4.2) * config.calories[1], 1200, 5000)),
      hrv:       Math.round(clamp(config.hrv[0]   + noise(i, 5.8) * config.hrv[1],       10, 180)),
      hydration: round1(clamp(config.hydration[0] + noise(i, 6.4) * config.hydration[1], 0.5, 5)),
    });
  }
  return entries;
}

export const MOCK_PROFILES: MockProfile[] = [
  {
    id: 'alex',
    name: 'Alex Chen',
    age: 32,
    bioAge: 27,
    emoji: '🏃',
    tagline: 'Elite Athlete · Recovery Optimized',
    data: generateDays(90, {
      sleep:     [8.2, 0.6],
      heartRate: [52,  8],
      activity:  [9.4, 3.2],
      calories:  [2900, 280],
      hrv:       [88,  18],
      hydration: [3.1, 0.5],
    }),
  },
  {
    id: 'sarah',
    name: 'Sarah Miller',
    age: 45,
    bioAge: 52,
    emoji: '💼',
    tagline: 'Stressed Professional · High Cortisol',
    data: generateDays(90, {
      sleep:     [5.9, 1.1],
      heartRate: [81,  12],
      activity:  [1.8, 1.0],
      calories:  [2050, 320],
      hrv:       [36,  10],
      hydration: [1.4, 0.4],
    }),
  },
  {
    id: 'marcus',
    name: 'Marcus Johnson',
    age: 58,
    bioAge: 55,
    emoji: '🧘',
    tagline: 'Balanced Senior · Mindful Lifestyle',
    data: generateDays(90, {
      sleep:     [7.1, 0.7],
      heartRate: [67,  9],
      activity:  [4.3, 1.8],
      calories:  [2180, 200],
      hrv:       [54,  14],
      hydration: [1.9, 0.4],
    }),
  },
];

export type MetricKey = 'sleep' | 'heartRate' | 'activity' | 'calories' | 'hrv' | 'hydration';

export const METRIC_META: Record<MetricKey, {
  label: string;
  unit: string;
  emoji: string;
  color: string;
  goodDirection: 'up' | 'down'; // 'up' = higher is better
}> = {
  sleep:     { label: 'Sleep',      unit: 'hrs', emoji: '😴', color: '#818CF8', goodDirection: 'up' },
  heartRate: { label: 'Heart Rate', unit: 'bpm', emoji: '❤️', color: '#F87171', goodDirection: 'down' },
  activity:  { label: 'Activity',   unit: 'km',  emoji: '🏃', color: '#34D399', goodDirection: 'up' },
  calories:  { label: 'Calories',   unit: 'kcal',emoji: '🔥', color: '#FBBF24', goodDirection: 'up' },
  hrv:       { label: 'HRV',        unit: 'ms',  emoji: '🧘', color: '#38BDF8', goodDirection: 'up' },
  hydration: { label: 'Hydration',  unit: 'L',   emoji: '💧', color: '#60A5FA', goodDirection: 'up' },
};
