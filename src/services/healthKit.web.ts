// This file is automatically used by Expo/Metro when building for the Web.
// We avoid importing 'react-native-health' here because it causes the browser to crash since it's an iOS-only native module.

export const initHealthKit = (): Promise<boolean> => {
  console.log('[Web] Mocking HealthKit initialization');
  return Promise.resolve(true);
};

export const getHealthDataForToday = async (): Promise<{
  stepCount?: number;
  activeEnergyBurned?: number;
  restingHeartRate?: number;
}> => {
  console.log('[Web] Returning mock HealthKit data');
  return {
    stepCount: 8432,
    activeEnergyBurned: 550,
    restingHeartRate: 65
  };
};
