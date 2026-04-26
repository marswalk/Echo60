import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Switch, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useProfile } from '../context/ProfileContext';
import { generateDays } from '../data/mockData';
import { calculateEcho60Age } from '../utils/bioAge';
import { Profile } from '../types';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { LiquidGlassView, isLiquidGlassSupported } from '@callstack/liquid-glass';

// A card that uses LiquidGlass on iOS 26+, falls back to a frosted dark card
function GlassCard({ children, style }: { children: React.ReactNode; style?: any }) {
  if (isLiquidGlassSupported) {
    return (
      <LiquidGlassView style={[styles.card, style]} effect="regular" interactive={false}>
        {children}
      </LiquidGlassView>
    );
  }
  return <View style={[styles.card, styles.cardFallback, style]}>{children}</View>;
}

// A row with label on left and control on right (for switches)
function SettingRow({ label, subtitle, children }: { label: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <GlassCard>
      <View style={styles.settingRow}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.settingLabel}>{label}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
        {children}
      </View>
    </GlassCard>
  );
}

// A slider with label and optional scale labels
function SliderCard({
  label, value, min, max, step, color, onValueChange, minLabel, maxLabel, unit,
}: {
  label: string; value: number; min: number; max: number; step: number;
  color: string; onValueChange: (v: number) => void; minLabel?: string; maxLabel?: string; unit?: string;
}) {
  return (
    <GlassCard>
      <View style={{ paddingHorizontal: 4 }}>
        <View style={styles.sliderHeader}>
          <Text style={styles.settingLabel}>{label}</Text>
          <Text style={[styles.sliderValue, { color }]}>{value}{unit ?? ''}</Text>
        </View>
        <Slider
          style={{ width: '100%', height: 36, marginTop: 4 }}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          onValueChange={onValueChange}
          minimumTrackTintColor={color}
          maximumTrackTintColor="rgba(255,255,255,0.08)"
          thumbTintColor={color}
        />
        {(minLabel || maxLabel) && (
          <View style={styles.scaleRow}>
            {minLabel && <Text style={styles.scaleLabel}>{minLabel}</Text>}
            {maxLabel && <Text style={styles.scaleLabel}>{maxLabel}</Text>}
          </View>
        )}
      </View>
    </GlassCard>
  );
}

// A segment picker (replace sex / activity chips)
function SegmentCard({ label, options, value, onSelect, color }: {
  label: string; options: string[]; value: string | string[]; onSelect: (v: string) => void; color?: string;
}) {
  const activeColor = color ?? '#38BDF8';
  const isMulti = Array.isArray(value);
  const isSelected = (opt: string) => isMulti ? (value as string[]).includes(opt) : value === opt;

  return (
    <GlassCard>
      <Text style={[styles.settingLabel, { marginBottom: 10 }]}>{label}</Text>
      <View style={styles.segmentRow}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            onPress={() => onSelect(opt)}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            style={[
              styles.chip,
              isSelected(opt) && { backgroundColor: activeColor },
            ]}
          >
            <Text style={[
              styles.chipText,
              isSelected(opt) && { color: '#050d12', fontWeight: '600' },
            ]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </GlassCard>
  );
}

export default function OnboardingScreen() {
  const { completeOnboarding, skipOnboarding } = useProfile();
  const [step, setStep] = useState(1);

  // Screen 1
  const [age, setAge] = useState('30');
  const [sex, setSex] = useState('Female');
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('65');

  // Screen 2
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [consistentSleep, setConsistentSleep] = useState(true);

  // Screen 3
  const [activeDays, setActiveDays] = useState(3);
  const [dailySteps, setDailySteps] = useState(8000);
  const [activityTypes, setActivityTypes] = useState<string[]>([]);

  // Screen 4
  const [dietQuality, setDietQuality] = useState(5);
  const [alcohol, setAlcohol] = useState(1);
  const [smoker, setSmoker] = useState(false);

  // Screen 5
  const [stressLevel, setStressLevel] = useState(5);
  const [overwhelmed, setOverwhelmed] = useState(3);
  const [mindfulness, setMindfulness] = useState(false);

  const handleFinish = async () => {
    const sleepBase = sleepHours;
    const sleepVar = sleepQuality > 7 ? 0.5 : (sleepQuality < 4 ? 1.5 : 1.0);
    const heartRateBase = Math.max(40, 70 + (stressLevel * 1.5) - (activeDays * 2));
    const heartRateVar = 10;
    const activityBase = (dailySteps / 1000) + (activeDays * 0.5);
    const activityVar = 2.0;
    const caloriesBase = 2000 + (activityBase * 50);
    const caloriesVar = dietQuality < 4 ? 400 : 200;
    const hrvBase = Math.max(20, 100 - (stressLevel * 5) + (mindfulness ? 15 : 0) - (alcohol * 5));
    const hrvVar = 15;
    const hydrationBase = 2.0;
    const hydrationVar = 0.5;

    const data = generateDays(90, {
      sleep: [sleepBase, sleepVar],
      heartRate: [heartRateBase, heartRateVar],
      activity: [activityBase, activityVar],
      calories: [caloriesBase, caloriesVar],
      hrv: [hrvBase, hrvVar],
      hydration: [hydrationBase, hydrationVar]
    });

    const bioAge = calculateEcho60Age(data);
    const initialAge = parseInt(age) || 30;

    const meProfile: Profile = {
      id: 'me',
      name: 'Me',
      age: initialAge,
      bioAge,
      emoji: '👋',
      tagline: 'Your Personal Health Data',
      data,
      historicalEcho60: [{ date: data[data.length - 1].date, age: bioAge }]
    };

    await completeOnboarding(meProfile);
  };

  const toggleActivity = (type: string) => {
    setActivityTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const renderScreen = () => {
    switch (step) {
      case 1:
        return (
          <Animated.View entering={FadeInRight} key="step1" style={styles.stepContainer}>
            <Text style={styles.stepTitle}>The Basics</Text>
            <Text style={styles.stepSubtitle}>Tell us a bit about yourself to calibrate your Echo60 Age.</Text>

            <GlassCard style={{ marginBottom: 12 }}>
              <Text style={styles.inputLabel}>Your Age</Text>
              <TextInput
                style={styles.nativeInput}
                keyboardType="number-pad"
                value={age}
                onChangeText={setAge}
                placeholder="30"
                placeholderTextColor="rgba(255,255,255,0.2)"
                returnKeyType="done"
              />
            </GlassCard>

            <SegmentCard
              label="Biological Sex"
              options={['Male', 'Female', 'Other']}
              value={sex}
              onSelect={setSex}
              color="#38BDF8"
            />

            <GlassCard style={{ marginTop: 12 }}>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Height (cm)</Text>
                  <TextInput
                    style={styles.nativeInput}
                    keyboardType="number-pad"
                    value={height}
                    onChangeText={setHeight}
                    placeholder="170"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    returnKeyType="done"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Weight (kg)</Text>
                  <TextInput
                    style={styles.nativeInput}
                    keyboardType="number-pad"
                    value={weight}
                    onChangeText={setWeight}
                    placeholder="65"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    returnKeyType="done"
                  />
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View entering={FadeInRight} key="step2" style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Sleep</Text>
            <Text style={styles.stepSubtitle}>Sleep is the single biggest driver of biological age.</Text>

            <SliderCard label="Avg. sleep per night" value={sleepHours} min={4} max={10} step={0.5}
              color="#818CF8" onValueChange={setSleepHours} unit="h" minLabel="4h" maxLabel="10h" />
            <View style={{ height: 12 }} />
            <SliderCard label="Sleep quality" value={sleepQuality} min={1} max={10} step={1}
              color="#818CF8" onValueChange={setSleepQuality} minLabel="Poor" maxLabel="Great" />
            <View style={{ height: 12 }} />
            <SettingRow label="Consistent sleep schedule" subtitle="Same bedtime most nights">
              <Switch value={consistentSleep} onValueChange={setConsistentSleep}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#818CF8' }}
                thumbColor="#fff" ios_backgroundColor="rgba(255,255,255,0.1)" />
            </SettingRow>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View entering={FadeInRight} key="step3" style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Movement</Text>
            <Text style={styles.stepSubtitle}>Activity is the cheapest medicine available.</Text>

            <SliderCard label="Active days per week" value={activeDays} min={0} max={7} step={1}
              color="#34D399" onValueChange={setActiveDays} minLabel="0" maxLabel="7 days" />
            <View style={{ height: 12 }} />
            <SliderCard label="Daily steps" value={dailySteps} min={0} max={15000} step={500}
              color="#34D399" onValueChange={setDailySteps} minLabel="0" maxLabel="15,000" />
            <View style={{ height: 12 }} />
            <SegmentCard
              label="Type of activity"
              options={['Walking', 'Gym', 'Cycling', 'Swimming', 'None']}
              value={activityTypes}
              onSelect={toggleActivity}
              color="#34D399"
            />
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View entering={FadeInRight} key="step4" style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Nutrition</Text>
            <Text style={styles.stepSubtitle}>What you eat shapes your body's biological clock.</Text>

            <SliderCard label="Diet quality" value={dietQuality} min={1} max={10} step={1}
              color="#FBBF24" onValueChange={setDietQuality} minLabel="Fast Food" maxLabel="Whole Foods" />
            <View style={{ height: 12 }} />
            <SliderCard label="Alcohol consumption" value={alcohol} min={0} max={3} step={1}
              color="#FBBF24" onValueChange={setAlcohol} minLabel="Never" maxLabel="Daily" />
            <View style={{ height: 12 }} />
            <SettingRow label="Smoker" subtitle="Current tobacco or nicotine use">
              <Switch value={smoker} onValueChange={setSmoker}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#FBBF24' }}
                thumbColor="#fff" ios_backgroundColor="rgba(255,255,255,0.1)" />
            </SettingRow>
          </Animated.View>
        );

      case 5:
        return (
          <Animated.View entering={FadeInRight} key="step5" style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Mind & Stress</Text>
            <Text style={styles.stepSubtitle}>Chronic stress accelerates aging at the cellular level.</Text>

            <SliderCard label="Average stress level" value={stressLevel} min={1} max={10} step={1}
              color="#38BDF8" onValueChange={setStressLevel} minLabel="Calm" maxLabel="High" />
            <View style={{ height: 12 }} />
            <SliderCard label="How often do you feel overwhelmed?" value={overwhelmed} min={1} max={5} step={1}
              color="#38BDF8" onValueChange={setOverwhelmed} minLabel="Rarely" maxLabel="Always" />
            <View style={{ height: 12 }} />
            <SettingRow label="Mindfulness practice" subtitle="Meditation, breathing, journalling">
              <Switch value={mindfulness} onValueChange={setMindfulness}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#38BDF8' }}
                thumbColor="#fff" ios_backgroundColor="rgba(255,255,255,0.1)" />
            </SettingRow>
          </Animated.View>
        );

      case 6:
        return (
          <Animated.View entering={FadeInRight} key="step6" style={[styles.stepContainer, { alignItems: 'center' }]}>
            <Text style={styles.stepTitle}>Almost there</Text>
            <Text style={[styles.stepSubtitle, { textAlign: 'center', maxWidth: 280 }]}>
              Connect Apple Health to pre-fill your baseline data automatically.
            </Text>

            <TouchableOpacity
              onPress={handleFinish}
              style={[styles.continueBtn, { width: '100%', maxWidth: 320, marginBottom: 12 }]}
            >
              <Text style={styles.continueBtnText}>Import from Apple Health</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleFinish}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={{ color: '#6B7B8D', fontSize: 15, fontWeight: '500', paddingVertical: 12 }}>
                Skip & Finish
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      {/* Fixed header: safe area + skip */}
      <View style={styles.header}>
        <View style={{ width: 60 }} />
        <View style={styles.progressWrap}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(step / 6) * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{step} of 6</Text>
        </View>
        <TouchableOpacity
          onPress={skipOnboarding}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.skipBtn}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderScreen()}

        {/* Navigation */}
        <View style={styles.navRow}>
          {step > 1 ? (
            <TouchableOpacity
              onPress={() => setStep(step - 1)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.backBtn}
            >
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          ) : <View style={{ width: 72 }} />}

          {step < 6 && (
            <TouchableOpacity
              onPress={() => setStep(step + 1)}
              style={styles.continueBtn}
            >
              <Text style={styles.continueBtnText}>Continue</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050d12',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  progressWrap: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 99,
  },
  progressLabel: {
    color: '#3C4A56',
    fontSize: 11,
    fontWeight: '500',
  },
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  skipText: {
    color: '#6B7B8D',
    fontSize: 15,
    fontWeight: '500',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 36,
    justifyContent: 'center',
  },
  stepContainer: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 8,
  },
  stepTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    color: '#6B7B8D',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  // Glass card
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 0,
    overflow: 'hidden',
  },
  cardFallback: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  // Setting row (for switches)
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    color: '#6B7B8D',
    fontSize: 13,
    marginTop: 2,
  },
  // Slider card
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderValue: {
    fontSize: 17,
    fontWeight: '700',
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  scaleLabel: {
    color: '#4B5563',
    fontSize: 11,
  },
  // Segment/chip picker
  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chipText: {
    color: '#A0B0BA',
    fontSize: 14,
    fontWeight: '500',
  },
  // Text input
  inputLabel: {
    color: '#6B7B8D',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nativeInput: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '400',
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  // Nav buttons
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
  },
  backBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  backBtnText: {
    color: '#A0B0BA',
    fontWeight: '600',
    fontSize: 16,
  },
  continueBtn: {
    paddingVertical: 15,
    paddingHorizontal: 36,
    borderRadius: 99,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  continueBtnText: {
    color: '#050d12',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
});
