import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { runSimulation } from '../engine/simulation';
import type { HealthData } from '../types';
import { parseAppleHealthXML } from '../utils/appleHealth';
import { ChevronRight, ChevronLeft, Upload } from 'lucide-react';

const STEPS = ['Demographics', 'Lifestyle', 'Diet & Mental Health', 'Medical History', 'Wearables'];

const defaultForm: Partial<HealthData> = {
  age: 30,
  sex: 'male',
  height: 170,
  weight: 70,
  smokingStatus: 'never',
  alcoholDrinksPerWeek: 2,
  exerciseDaysPerWeek: 3,
  exerciseMinutesPerSession: 30,
  sleepHoursPerNight: 7,
  dietQuality: 3,
  fruitVegServingsPerDay: 3,
  stressLevel: 3,
  socialConnections: 3,
  hasHypertension: false,
  hasDiabetes: false,
  hasHeartDisease: false,
};

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-slate-300 mb-1">{children}</label>;
}

function Input({
  type = 'number',
  value,
  onChange,
  min,
  max,
  step,
}: {
  type?: string;
  value: number | string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      type={type}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-400"
    />
  );
}

function RangeInput({
  label,
  value,
  onChange,
  min,
  max,
  labels,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  labels: string[];
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <span className="text-slate-400 text-xs w-16">{labels[0]}</span>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 accent-purple-500"
        />
        <span className="text-slate-400 text-xs w-16 text-right">{labels[labels.length - 1]}</span>
      </div>
      <div className="text-center text-purple-300 text-sm font-semibold mt-1">
        {value} / {max}
      </div>
    </div>
  );
}

function ToggleGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
              value === opt.value
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-purple-500"
      />
      <span className="text-slate-300 text-sm">{label}</span>
    </label>
  );
}

export function QuestionnaireScreen() {
  const { updateHealthData, setSimulation, navigateTo } = useApp();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Partial<HealthData>>(defaultForm);
  const [appleUploadStatus, setAppleUploadStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');

  const set = <K extends keyof HealthData>(key: K, value: HealthData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleAppleHealth = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAppleUploadStatus('loading');
    try {
      const parsed = await parseAppleHealthXML(file);
      setForm((f) => ({
        ...f,
        ...(parsed.avgDailySteps !== undefined && { avgDailySteps: parsed.avgDailySteps }),
        ...(parsed.avgRestingHeartRate !== undefined && {
          avgRestingHeartRate: parsed.avgRestingHeartRate,
        }),
        ...(parsed.avgHRV !== undefined && { avgHRV: parsed.avgHRV }),
        ...(parsed.avgSleepHours !== undefined && { sleepHoursPerNight: parsed.avgSleepHours }),
        ...(parsed.weight !== undefined && { weight: parsed.weight }),
        ...(parsed.height !== undefined && { height: parsed.height }),
      }));
      setAppleUploadStatus('success');
    } catch {
      setAppleUploadStatus('error');
    }
  };

  const handleComplete = () => {
    const healthData = form as HealthData;
    updateHealthData(healthData);
    const result = runSimulation(healthData);
    setSimulation(result);
    navigateTo('processing');
  };

  const canProceed = () => {
    if (step === 0) return form.age && form.sex && form.height && form.weight;
    if (step === 1)
      return (
        form.smokingStatus !== undefined &&
        form.alcoholDrinksPerWeek !== undefined &&
        form.exerciseDaysPerWeek !== undefined &&
        form.exerciseMinutesPerSession !== undefined &&
        form.sleepHoursPerNight !== undefined
      );
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-8">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">
            Echo<span className="text-purple-400">60</span>
          </h1>
          <p className="text-slate-400 text-sm">Health Assessment</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`text-xs ${i === step ? 'text-purple-400 font-semibold' : i < step ? 'text-slate-400' : 'text-slate-600'}`}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
          <div className="text-center text-slate-400 text-xs mt-2">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 space-y-5 border border-white/10">
          {/* Step 0: Demographics */}
          {step === 0 && (
            <>
              <div>
                <Label>Age</Label>
                <Input
                  value={form.age ?? 30}
                  min={18}
                  max={100}
                  onChange={(v) => set('age', Number(v))}
                />
              </div>
              <ToggleGroup
                label="Biological Sex"
                value={form.sex ?? 'male'}
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
                onChange={(v) => set('sex', v)}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Height (cm)</Label>
                  <Input
                    value={form.height ?? 170}
                    min={100}
                    max={250}
                    onChange={(v) => set('height', Number(v))}
                  />
                </div>
                <div>
                  <Label>Weight (kg)</Label>
                  <Input
                    value={form.weight ?? 70}
                    min={30}
                    max={300}
                    step={0.1}
                    onChange={(v) => set('weight', Number(v))}
                  />
                </div>
              </div>
              {form.height && form.weight && (
                <div className="bg-purple-900/40 rounded-lg p-3 text-sm text-purple-200">
                  BMI:{' '}
                  <span className="font-bold">
                    {(form.weight / (form.height / 100) ** 2).toFixed(1)}
                  </span>
                </div>
              )}
            </>
          )}

          {/* Step 1: Lifestyle */}
          {step === 1 && (
            <>
              <ToggleGroup
                label="Smoking Status"
                value={form.smokingStatus ?? 'never'}
                options={[
                  { value: 'never', label: 'Never' },
                  { value: 'former', label: 'Former' },
                  { value: 'current', label: 'Current' },
                ]}
                onChange={(v) => set('smokingStatus', v)}
              />
              <div>
                <Label>Alcoholic drinks per week</Label>
                <Input
                  value={form.alcoholDrinksPerWeek ?? 0}
                  min={0}
                  max={50}
                  onChange={(v) => set('alcoholDrinksPerWeek', Number(v))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Exercise days/week</Label>
                  <Input
                    value={form.exerciseDaysPerWeek ?? 0}
                    min={0}
                    max={7}
                    onChange={(v) => set('exerciseDaysPerWeek', Number(v))}
                  />
                </div>
                <div>
                  <Label>Minutes per session</Label>
                  <Input
                    value={form.exerciseMinutesPerSession ?? 0}
                    min={0}
                    max={180}
                    onChange={(v) => set('exerciseMinutesPerSession', Number(v))}
                  />
                </div>
              </div>
              {form.exerciseDaysPerWeek !== undefined &&
                form.exerciseMinutesPerSession !== undefined && (
                  <div className="bg-purple-900/40 rounded-lg p-3 text-sm text-purple-200">
                    Weekly exercise:{' '}
                    <span className="font-bold">
                      {form.exerciseDaysPerWeek * form.exerciseMinutesPerSession} min
                    </span>{' '}
                    (WHO recommends 150+ min)
                  </div>
                )}
              <div>
                <Label>Sleep hours per night</Label>
                <Input
                  value={form.sleepHoursPerNight ?? 7}
                  min={2}
                  max={14}
                  step={0.5}
                  onChange={(v) => set('sleepHoursPerNight', Number(v))}
                />
              </div>
            </>
          )}

          {/* Step 2: Diet & Mental Health */}
          {step === 2 && (
            <>
              <RangeInput
                label="Diet Quality"
                value={form.dietQuality ?? 3}
                min={1}
                max={5}
                labels={['Poor', 'Excellent']}
                onChange={(v) => set('dietQuality', v as 1 | 2 | 3 | 4 | 5)}
              />
              <div>
                <Label>Fruit & vegetable servings per day</Label>
                <Input
                  value={form.fruitVegServingsPerDay ?? 3}
                  min={0}
                  max={20}
                  onChange={(v) => set('fruitVegServingsPerDay', Number(v))}
                />
              </div>
              <RangeInput
                label="Stress Level"
                value={form.stressLevel ?? 3}
                min={1}
                max={5}
                labels={['Low', 'High']}
                onChange={(v) => set('stressLevel', v as 1 | 2 | 3 | 4 | 5)}
              />
              <RangeInput
                label="Social Connections"
                value={form.socialConnections ?? 3}
                min={1}
                max={5}
                labels={['Isolated', 'Very Connected']}
                onChange={(v) => set('socialConnections', v as 1 | 2 | 3 | 4 | 5)}
              />
            </>
          )}

          {/* Step 3: Medical History */}
          {step === 3 && (
            <>
              <p className="text-slate-400 text-sm mb-4">
                Have you been diagnosed with any of the following conditions?
              </p>
              <div className="space-y-4">
                <CheckboxField
                  label="High Blood Pressure (Hypertension)"
                  checked={form.hasHypertension ?? false}
                  onChange={(v) => set('hasHypertension', v)}
                />
                <CheckboxField
                  label="Diabetes (Type 1 or Type 2)"
                  checked={form.hasDiabetes ?? false}
                  onChange={(v) => set('hasDiabetes', v)}
                />
                <CheckboxField
                  label="Heart Disease / Cardiovascular Disease"
                  checked={form.hasHeartDisease ?? false}
                  onChange={(v) => set('hasHeartDisease', v)}
                />
              </div>
            </>
          )}

          {/* Step 4: Wearables / Apple Health */}
          {step === 4 && (
            <>
              <p className="text-slate-300 text-sm mb-4">
                Optionally upload your Apple Health export for more accurate results. Or enter values
                manually.
              </p>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center">
                <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <p className="text-slate-300 text-sm mb-2">Upload export.xml from Apple Health</p>
                <label className="cursor-pointer bg-purple-600 hover:bg-purple-500 text-white text-sm px-4 py-2 rounded-lg transition-all">
                  Choose File
                  <input
                    type="file"
                    accept=".xml"
                    className="hidden"
                    onChange={handleAppleHealth}
                  />
                </label>
                {appleUploadStatus === 'loading' && (
                  <p className="text-purple-300 text-xs mt-2">Parsing health data...</p>
                )}
                {appleUploadStatus === 'success' && (
                  <p className="text-emerald-400 text-xs mt-2">✓ Health data imported!</p>
                )}
                {appleUploadStatus === 'error' && (
                  <p className="text-red-400 text-xs mt-2">Failed to parse file. Enter manually.</p>
                )}
              </div>

              <p className="text-slate-400 text-xs text-center">— or enter manually —</p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Avg daily steps</Label>
                  <Input
                    value={form.avgDailySteps ?? ''}
                    min={0}
                    max={50000}
                    onChange={(v) => set('avgDailySteps', v ? Number(v) : undefined as unknown as number)}
                  />
                </div>
                <div>
                  <Label>Resting heart rate (bpm)</Label>
                  <Input
                    value={form.avgRestingHeartRate ?? ''}
                    min={30}
                    max={120}
                    onChange={(v) =>
                      set('avgRestingHeartRate', v ? Number(v) : undefined as unknown as number)
                    }
                  />
                </div>
              </div>
              <div>
                <Label>HRV (ms, optional)</Label>
                <Input
                  value={form.avgHRV ?? ''}
                  min={0}
                  max={200}
                  onChange={(v) => set('avgHRV', v ? Number(v) : undefined as unknown as number)}
                />
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          {step > 0 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-full transition-all cursor-pointer"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-3 rounded-full transition-all transform hover:scale-105 cursor-pointer"
            >
              Calculate My Age <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
