import { DailyEntry } from '../types';

/**
 * Calculates the user's biological age at 60 (Echo60 Age) based on recent health data.
 * Baseline is 60. We use a simple algorithm based on the 7-day average of metrics.
 * 
 * Better health markers (high HRV, adequate sleep, high activity) subtract from 60 (making you "younger").
 * Poorer markers add to 60 (making you "older").
 */
export function calculateEcho60Age(entries: DailyEntry[]): number {
  if (!entries || entries.length === 0) return 60;

  // Use up to the last 7 days of data
  const recent = entries.slice(-7);
  const count = recent.length;

  let avgSleep = 0;
  let avgHR = 0;
  let avgActivity = 0;
  let avgHRV = 0;

  recent.forEach(entry => {
    avgSleep += entry.sleep;
    avgHR += entry.heartRate;
    avgActivity += entry.activity;
    avgHRV += entry.hrv;
  });

  avgSleep /= count;
  avgHR /= count;
  avgActivity /= count;
  avgHRV /= count;

  let ageAdjustment = 0;

  // Sleep adjustment (Optimal: 7-8.5 hrs)
  if (avgSleep < 6) {
    ageAdjustment += 2; // Penalty for lack of sleep
  } else if (avgSleep < 7) {
    ageAdjustment += 1;
  } else if (avgSleep >= 7 && avgSleep <= 8.5) {
    ageAdjustment -= 1.5; // Bonus for good sleep
  } else if (avgSleep > 9) {
    ageAdjustment += 0.5; // Slight penalty for oversleeping
  }

  // Resting Heart Rate adjustment (Optimal: 50-65)
  if (avgHR > 80) {
    ageAdjustment += 2;
  } else if (avgHR > 70) {
    ageAdjustment += 1;
  } else if (avgHR < 65) {
    ageAdjustment -= 1;
  }

  // Activity adjustment (Optimal: > 5km/day)
  if (avgActivity < 2) {
    ageAdjustment += 2;
  } else if (avgActivity >= 5 && avgActivity < 8) {
    ageAdjustment -= 1;
  } else if (avgActivity >= 8) {
    ageAdjustment -= 2;
  }

  // HRV adjustment (Higher is generally better, context dependent but assume >60 is good)
  if (avgHRV < 30) {
    ageAdjustment += 2;
  } else if (avgHRV < 45) {
    ageAdjustment += 1;
  } else if (avgHRV > 65) {
    ageAdjustment -= 1.5;
  } else if (avgHRV > 80) {
    ageAdjustment -= 2.5;
  }

  // Calculate final
  const echo60Age = 60 + ageAdjustment;

  // Bound it between 40 and 80 for sanity
  return Math.max(40, Math.min(80, Math.round(echo60Age * 10) / 10));
}
