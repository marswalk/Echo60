import { DailyEntry } from '../types';

/**
 * HealthKitService acts as a wrapper around Apple Health / Google Fit.
 * Currently, it returns a stubbed fetch to avoid native build requirements,
 * but it is structured to drop in `react-native-health` later.
 */
export class HealthKitService {
  static async requestPermissions(): Promise<boolean> {
    console.log('[HealthKitService] Requesting permissions...');
    // TODO: implement react-native-health permission request
    return true;
  }

  static async fetchRecentData(date: Date): Promise<Partial<DailyEntry>> {
    console.log(`[HealthKitService] Fetching data for ${date.toISOString().split('T')[0]}...`);
    // TODO: use rn-apple-healthkit to fetch actual Step Count, Heart Rate, Sleep Analysis
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return a slightly randomized stub to show it's "working"
    return {
      heartRate: Math.floor(Math.random() * (75 - 55 + 1)) + 55,
      activity: Math.floor(Math.random() * (10 - 2 + 1)) + 2,
    };
  }
}
