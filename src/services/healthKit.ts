export const initHealthKit = (): Promise<boolean> => {
  return Promise.resolve(true);
};

export const getHealthDataForToday = async (): Promise<{
  stepCount?: number;
  activeEnergyBurned?: number;
  restingHeartRate?: number;
}> => {
  return {
    stepCount: 6543,
    activeEnergyBurned: 450,
    restingHeartRate: 68,
  };
};
