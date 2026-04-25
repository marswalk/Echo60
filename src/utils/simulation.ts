import { HealthProfile, Trajectory, TrajectoryDataPoint } from "../types";

export function calculateBiologicalAge(profile: HealthProfile): number {
  let ageOffset = 0;

  // Sleep: optimal 7-8 hours
  if (profile.sleepHours < 6) ageOffset += 2;
  else if (profile.sleepHours > 9) ageOffset += 1;
  else ageOffset -= 1;

  // Exercise: optimal 3-5 days
  if (profile.exerciseFrequency < 1) ageOffset += 3;
  else if (profile.exerciseFrequency > 3) ageOffset -= 2;
  else ageOffset -= 0.5;

  // Diet: 1-10 scale
  if (profile.dietQuality < 4) ageOffset += 2;
  else if (profile.dietQuality > 7) ageOffset -= 1.5;

  // Stress: 1-10 scale
  if (profile.stressLevel > 7) ageOffset += 2;
  else if (profile.stressLevel < 4) ageOffset -= 1;

  // HealthKit Modifiers (if available)
  if (profile.stepCount) {
    if (profile.stepCount > 8000) ageOffset -= 1;
    if (profile.stepCount < 3000) ageOffset += 1;
  }

  // Ensure age isn't negative or unrealistically low
  return Math.max(18, profile.age + ageOffset);
}

export function calculateTrajectories(profile: HealthProfile): Trajectory[] {
  const currentBioAge = calculateBiologicalAge(profile);
  const yearsToProject = 30;

  // Calculate base decline rates (higher is worse)
  const currentDeclineRate = 1.0 + Math.max(0, (currentBioAge - profile.age) / 20);
  const optimisticDeclineRate = 0.5; // Optimized habits
  const pessimisticDeclineRate = currentDeclineRate * 1.5; // Worsening habits

  const generateData = (declineRate: number, startHealthScore: number): TrajectoryDataPoint[] => {
    const data: TrajectoryDataPoint[] = [];
    let currentScore = startHealthScore;
    for (let i = 0; i <= yearsToProject; i += 5) {
      data.push({
        age: profile.age + i,
        healthScore: Math.max(0, Math.round(currentScore)),
      });
      currentScore -= declineRate * 5; // Decline over 5 years
    }
    return data;
  };

  const startScore = 100 - (currentBioAge - profile.age) * 2;

  return [
    {
      type: "optimistic",
      label: "Optimized Path",
      data: generateData(optimisticDeclineRate, startScore),
      finalBiologicalAge: currentBioAge + yearsToProject * 0.8, // Ages slower
    },
    {
      type: "current",
      label: "Current Path",
      data: generateData(currentDeclineRate, startScore),
      finalBiologicalAge: currentBioAge + yearsToProject * 1.0,
    },
    {
      type: "pessimistic",
      label: "Warning Path",
      data: generateData(pessimisticDeclineRate, startScore),
      finalBiologicalAge: currentBioAge + yearsToProject * 1.3, // Ages faster
    },
  ];
}

export function determineSingleBestHabit(profile: HealthProfile): string {
  // Find the weakest link in the user's profile
  const deficits = [
    { name: "sleep", score: profile.sleepHours < 7 ? 7 - profile.sleepHours : 0 },
    { name: "exercise", score: profile.exerciseFrequency < 3 ? 3 - profile.exerciseFrequency : 0 },
    { name: "diet", score: profile.dietQuality < 6 ? 6 - profile.dietQuality : 0 },
    { name: "stress", score: profile.stressLevel > 6 ? profile.stressLevel - 6 : 0 },
  ];

  deficits.sort((a, b) => b.score - a.score);
  const biggestDeficit = deficits[0];

  if (biggestDeficit.score === 0) {
    return "Keep up the excellent work! Try to maintain your current healthy routines.";
  }

  switch (biggestDeficit.name) {
    case "sleep":
      return "Prioritize getting at least 7 hours of sleep. It's the foundation of your recovery and long-term vitality.";
    case "exercise":
      return "Aim for just 20 minutes of elevated heart rate activity 3 times a week. Small movements compound massively.";
    case "diet":
      return "Try adding one serving of leafy greens to your daily diet to significantly boost cellular health.";
    case "stress":
      return "Incorporate a 5-minute daily mindfulness or deep breathing practice to lower your chronic cortisol levels.";
    default:
      return "Make one small healthy choice today.";
  }
}
