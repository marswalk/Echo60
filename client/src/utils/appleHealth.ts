export interface ParsedAppleHealth {
  avgDailySteps?: number;
  avgRestingHeartRate?: number;
  avgHRV?: number;
  avgSleepHours?: number;
  weight?: number;
  height?: number;
}

export async function parseAppleHealthXML(file: File): Promise<ParsedAppleHealth> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const xml = e.target?.result as string;
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, 'application/xml');

        const records = doc.querySelectorAll('Record');
        const result: ParsedAppleHealth = {};

        const stepCounts: number[] = [];
        const heartRates: number[] = [];
        const hrvs: number[] = [];
        const sleepMinutes: number[] = [];

        records.forEach((record) => {
          const type = record.getAttribute('type') || '';
          const value = parseFloat(record.getAttribute('value') || '0');

          if (type === 'HKQuantityTypeIdentifierStepCount') {
            if (!isNaN(value) && value > 0) stepCounts.push(value);
          } else if (type === 'HKQuantityTypeIdentifierHeartRate') {
            if (!isNaN(value) && value > 30 && value < 220) heartRates.push(value);
          } else if (type === 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN') {
            if (!isNaN(value) && value > 0) hrvs.push(value);
          } else if (type === 'HKCategoryTypeIdentifierSleepAnalysis') {
            const start = new Date(record.getAttribute('startDate') || '');
            const end = new Date(record.getAttribute('endDate') || '');
            const sleepValue = record.getAttribute('value') || '';
            if (
              !isNaN(start.getTime()) &&
              !isNaN(end.getTime()) &&
              sleepValue !== 'HKCategoryValueSleepAnalysisAwake'
            ) {
              const minutes = (end.getTime() - start.getTime()) / 60000;
              if (minutes > 0 && minutes < 720) sleepMinutes.push(minutes);
            }
          } else if (type === 'HKQuantityTypeIdentifierBodyMass') {
            if (!isNaN(value) && value > 20) result.weight = Math.round(value * 10) / 10;
          } else if (type === 'HKQuantityTypeIdentifierHeight') {
            if (!isNaN(value) && value > 0.5) result.height = Math.round(value * 100);
          }
        });

        if (stepCounts.length > 0) {
          result.avgDailySteps = Math.round(
            stepCounts.reduce((a, b) => a + b, 0) / stepCounts.length
          );
        }
        if (heartRates.length > 0) {
          const sorted = [...heartRates].sort((a, b) => a - b);
          const bottom20 = sorted.slice(0, Math.ceil(sorted.length * 0.2));
          result.avgRestingHeartRate = Math.round(
            bottom20.reduce((a, b) => a + b, 0) / bottom20.length
          );
        }
        if (hrvs.length > 0) {
          result.avgHRV = Math.round(hrvs.reduce((a, b) => a + b, 0) / hrvs.length);
        }
        if (sleepMinutes.length > 0) {
          result.avgSleepHours =
            Math.round(
              (sleepMinutes.reduce((a, b) => a + b, 0) / sleepMinutes.length / 60) * 10
            ) / 10;
        }

        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
