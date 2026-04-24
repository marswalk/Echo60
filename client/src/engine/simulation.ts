import type { HealthData, SimulationResult, Trajectory, TrajectoryPoint } from '../types';

export function calculateBiologicalAge(data: HealthData): number {
  let agingOffset = 0;

  const bmi = data.weight / ((data.height / 100) ** 2);
  if (bmi > 30) agingOffset += 3;
  else if (bmi > 25) agingOffset += 1.5;
  else if (bmi < 18.5) agingOffset += 2;

  if (data.smokingStatus === 'current') agingOffset += 5;
  else if (data.smokingStatus === 'former') agingOffset += 2;

  const weeklyExerciseMinutes = data.exerciseDaysPerWeek * data.exerciseMinutesPerSession;
  if (weeklyExerciseMinutes >= 150) agingOffset -= 3;
  else if (weeklyExerciseMinutes >= 75) agingOffset -= 1.5;
  else if (weeklyExerciseMinutes < 30) agingOffset += 2;

  if (data.sleepHoursPerNight < 6) agingOffset += 3;
  else if (data.sleepHoursPerNight > 9) agingOffset += 1;
  else if (data.sleepHoursPerNight >= 7 && data.sleepHoursPerNight <= 8) agingOffset -= 1;

  agingOffset += (3 - data.dietQuality) * 1.5;

  if (data.alcoholDrinksPerWeek > 14) agingOffset += 3;
  else if (data.alcoholDrinksPerWeek > 7) agingOffset += 1.5;

  if (data.stressLevel >= 4) agingOffset += 2;
  else if (data.stressLevel <= 2) agingOffset -= 1;

  if (data.socialConnections <= 2) agingOffset += 2;
  else if (data.socialConnections >= 4) agingOffset -= 1;

  if (data.hasHypertension) agingOffset += 3;
  if (data.hasDiabetes) agingOffset += 4;
  if (data.hasHeartDisease) agingOffset += 5;

  if (data.avgDailySteps) {
    if (data.avgDailySteps >= 10000) agingOffset -= 2;
    else if (data.avgDailySteps >= 7500) agingOffset -= 1;
    else if (data.avgDailySteps < 3000) agingOffset += 2;
  }

  if (data.avgRestingHeartRate) {
    if (data.avgRestingHeartRate < 60) agingOffset -= 1;
    else if (data.avgRestingHeartRate > 80) agingOffset += 2;
  }

  return Math.round((data.age + agingOffset) * 10) / 10;
}

export function calculateAgingRate(data: HealthData): number {
  let rate = 1.0;

  const bmi = data.weight / ((data.height / 100) ** 2);
  if (bmi > 30) rate += 0.05;
  if (data.smokingStatus === 'current') rate += 0.08;
  const weeklyMin = data.exerciseDaysPerWeek * data.exerciseMinutesPerSession;
  if (weeklyMin >= 150) rate -= 0.06;
  if (data.sleepHoursPerNight < 6) rate += 0.04;
  if (data.stressLevel >= 4) rate += 0.03;
  if (data.dietQuality >= 4) rate -= 0.04;
  if (data.hasHypertension) rate += 0.04;
  if (data.hasDiabetes) rate += 0.05;

  return Math.max(0.5, Math.min(1.8, rate));
}

function generateTrajectoryPoints(
  startAge: number,
  startBioAge: number,
  agingRate: number,
  years: number = 30
): TrajectoryPoint[] {
  const points: TrajectoryPoint[] = [];

  for (let y = 0; y <= years; y++) {
    const bioAge = startBioAge + y * agingRate;
    const healthScore = Math.max(0, Math.min(100, 100 - (bioAge - startAge - y) * 5));
    points.push({
      year: y,
      age: startAge + y,
      biologicalAge: Math.round(bioAge * 10) / 10,
      healthScore: Math.round(healthScore),
    });
  }
  return points;
}

export function getTopHabitChange(data: HealthData): SimulationResult['topHabitChange'] {
  interface Candidate {
    habit: string;
    impact: string;
    description: string;
    potentialYearsGained: number;
    score: number;
  }
  const candidates: Candidate[] = [];

  if (data.smokingStatus === 'current') {
    candidates.push({
      habit: 'Quit Smoking',
      impact: 'Reduces biological age by up to 5 years',
      description:
        'Quitting smoking is the single most impactful health change you can make. Within 10 years, your lung cancer risk halves. Your body begins healing within 20 minutes of your last cigarette.',
      potentialYearsGained: 7,
      score: 10,
    });
  }

  const weeklyMin = data.exerciseDaysPerWeek * data.exerciseMinutesPerSession;
  if (weeklyMin < 75) {
    candidates.push({
      habit: 'Start Regular Exercise',
      impact: 'Reduces biological age by up to 3 years',
      description:
        'Just 150 minutes of moderate exercise per week — 30 minutes, 5 days — dramatically reduces all-cause mortality. Start with brisk walks and build up.',
      potentialYearsGained: 4,
      score: data.smokingStatus === 'current' ? 7 : 9,
    });
  }

  if (data.sleepHoursPerNight < 7) {
    candidates.push({
      habit: 'Prioritize 7-8 Hours of Sleep',
      impact: 'Reduces biological age by up to 3 years',
      description:
        'Chronic sleep deprivation accelerates aging at the cellular level. Fixing your sleep is one of the highest-leverage health changes you can make.',
      potentialYearsGained: 3,
      score: 8,
    });
  }

  if (data.stressLevel >= 4) {
    candidates.push({
      habit: 'Implement Daily Stress Management',
      impact: 'Reduces biological age by up to 2 years',
      description:
        '10 minutes of daily meditation or breathing exercises measurably reduces cortisol, improves telomere length, and slows cellular aging.',
      potentialYearsGained: 2,
      score: 6,
    });
  }

  if (data.dietQuality <= 2) {
    candidates.push({
      habit: 'Adopt a Mediterranean Diet',
      impact: 'Reduces biological age by up to 3 years',
      description:
        'A diet rich in vegetables, fruits, whole grains, and healthy fats reduces inflammation — the root cause of most chronic diseases and accelerated aging.',
      potentialYearsGained: 3,
      score: 7,
    });
  }

  const bmi = data.weight / ((data.height / 100) ** 2);
  if (bmi > 30) {
    candidates.push({
      habit: 'Achieve Healthy Body Weight',
      impact: 'Reduces biological age by up to 3 years',
      description:
        'Losing even 5-10% of body weight significantly reduces your risk of diabetes, heart disease, and cancer. Start with sustainable small changes.',
      potentialYearsGained: 3,
      score: 8,
    });
  }

  if (candidates.length === 0) {
    candidates.push({
      habit: 'Deepen Social Connections',
      impact: 'Reduces biological age by up to 2 years',
      description:
        'Strong social relationships are one of the most overlooked determinants of longevity. Schedule regular time with people who matter to you.',
      potentialYearsGained: 2,
      score: 5,
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  const top = candidates[0];
  return {
    habit: top.habit,
    impact: top.impact,
    description: top.description,
    potentialYearsGained: top.potentialYearsGained,
  };
}

export function runSimulation(data: HealthData): SimulationResult {
  const currentBioAge = calculateBiologicalAge(data);
  const agingRate = calculateAgingRate(data);

  const currentPoints = generateTrajectoryPoints(data.age, currentBioAge, agingRate);

  const optimizedRate = Math.max(0.5, agingRate - 0.25);
  const optimizedBioAge = currentBioAge - 2;
  const optimizedPoints = generateTrajectoryPoints(data.age, optimizedBioAge, optimizedRate);

  const declineRate = Math.min(1.8, agingRate + 0.2);
  const declineBioAge = currentBioAge + 2;
  const declinePoints = generateTrajectoryPoints(data.age, declineBioAge, declineRate);

  const trajectories: Trajectory[] = [
    {
      id: 'optimized',
      label: 'Optimized Path',
      color: '#10b981',
      description: 'If you make key lifestyle improvements starting today',
      points: optimizedPoints,
      biologicalAgeAt30Years: optimizedPoints[30].biologicalAge,
      keyChanges: ['Regular exercise', 'Improved diet', 'Quality sleep', 'Stress management'],
    },
    {
      id: 'current',
      label: 'Current Path',
      color: '#3b82f6',
      description: 'If you continue your current lifestyle',
      points: currentPoints,
      biologicalAgeAt30Years: currentPoints[30].biologicalAge,
      keyChanges: [],
    },
    {
      id: 'decline',
      label: 'Decline Path',
      color: '#ef4444',
      description: 'If current habits worsen over time',
      points: declinePoints,
      biologicalAgeAt30Years: declinePoints[30].biologicalAge,
      keyChanges: [],
    },
  ];

  return {
    currentBiologicalAge: currentBioAge,
    chronologicalAge: data.age,
    agingRate,
    trajectories,
    topHabitChange: getTopHabitChange(data),
  };
}
