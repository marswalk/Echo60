import AppleHealthKit, { HealthValue, HealthKitPermissions } from 'react-native-health';
import { Platform } from 'react-native';

// Safely handle environments where the native module is missing (like Expo Go or Android)
const isHealthKitAvailable = Platform.OS === 'ios' && !!AppleHealthKit && !!AppleHealthKit.Constants;

const permissions = isHealthKitAvailable ? {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.StepCount,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.RestingHeartRate,
    ],
    write: [],
  },
} as HealthKitPermissions : {} as HealthKitPermissions;

export const initHealthKit = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!isHealthKitAvailable) {
      console.warn('[WARNING] HealthKit is not available in this environment (e.g., Android or Expo Go). Mocking success.');
      return resolve(true); // Return true so the app flow can continue during hackathon testing
    }

    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        console.error('[ERROR] Cannot grant permissions!', error);
        return resolve(false);
      }
      resolve(true);
    });
  });
};

export const getHealthDataForToday = async (): Promise<{
  stepCount?: number;
  activeEnergyBurned?: number;
  restingHeartRate?: number;
}> => {
  if (!isHealthKitAvailable) {
    // Return mock data for testing on Windows/Expo Go!
    return {
      stepCount: 6543,
      activeEnergyBurned: 450,
      restingHeartRate: 68
    };
  }

  const options = {
    date: new Date().toISOString(), // today
  };

  const fetchSteps = (): Promise<number> =>
    new Promise((resolve) => {
      AppleHealthKit.getStepCount(options, (err: Object, results: HealthValue) => {
        if (err || !results) resolve(0);
        else resolve(results.value);
      });
    });

  const fetchEnergy = (): Promise<number> =>
    new Promise((resolve) => {
      AppleHealthKit.getActiveEnergyBurned(options, (err: Object, results: HealthValue[]) => {
        if (err || !results || results.length === 0) resolve(0);
        else resolve(results[0].value);
      });
    });

  const fetchHR = (): Promise<number> =>
    new Promise((resolve) => {
      AppleHealthKit.getRestingHeartRate(options, (err: Object, results: HealthValue[]) => {
        if (err || !results || results.length === 0) resolve(0);
        else resolve(results[0].value);
      });
    });

  try {
    const [stepCount, activeEnergyBurned, restingHeartRate] = await Promise.all([
      fetchSteps(),
      fetchEnergy(),
      fetchHR(),
    ]);

    return { stepCount, activeEnergyBurned, restingHeartRate };
  } catch (e) {
    console.error("Error fetching health data", e);
    return {};
  }
};
