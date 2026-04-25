import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import { useProfile } from '../context/ProfileContext';
import { generateDays } from '../data/mockData';
import { calculateEcho60Age } from '../utils/bioAge';
import { Profile } from '../types';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function OnboardingScreen() {
  const { completeOnboarding, skipOnboarding } = useProfile();
  const [step, setStep] = useState(1);

  // Screen 1: Basics
  const [age, setAge] = useState('30');
  const [sex, setSex] = useState('Female');
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('65');

  // Screen 2: Sleep
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [consistentSleep, setConsistentSleep] = useState(true);

  // Screen 3: Movement
  const [activeDays, setActiveDays] = useState(3);
  const [dailySteps, setDailySteps] = useState(8000);
  const [activityTypes, setActivityTypes] = useState<string[]>([]); // Walking, Gym, Cycling, Swimming, None

  // Screen 4: Nutrition & Substances
  const [dietQuality, setDietQuality] = useState(5);
  const [alcohol, setAlcohol] = useState(1);
  const [smoker, setSmoker] = useState(false);

  // Screen 5: Mind & Stress
  const [stressLevel, setStressLevel] = useState(5);
  const [overwhelmed, setOverwhelmed] = useState(3);
  const [mindfulness, setMindfulness] = useState(false);

  const handleFinish = async () => {
    // Generate data based on answers
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
      bioAge: bioAge,
      emoji: '👋',
      tagline: 'Your Personal Health Data',
      data: data,
      historicalEcho60: [{
        date: data[data.length - 1].date,
        age: bioAge
      }]
    };

    await completeOnboarding(meProfile);
  };

  const toggleActivity = (type: string) => {
    if (activityTypes.includes(type)) {
      setActivityTypes(activityTypes.filter(t => t !== type));
    } else {
      setActivityTypes([...activityTypes, type]);
    }
  };

  const renderScreen = () => {
    switch(step) {
      case 1:
        return (
          <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1 justify-center">
            <Text className="text-white text-3xl font-semibold mb-8 text-center">The Basics</Text>
            
            <View className="mb-6">
              <Text className="text-gray-400 mb-2">Age (18-90)</Text>
              <TextInput 
                className="bg-[#141419] text-white p-4 rounded-xl text-lg"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
                placeholderTextColor="#A0B0BA"
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-400 mb-2">Biological Sex</Text>
              <View className="flex-row justify-between">
                {['Male', 'Female', 'Prefer not to say'].map(opt => (
                  <TouchableOpacity 
                    key={opt}
                    onPress={() => setSex(opt)}
                    className={`p-3 rounded-xl flex-1 mx-1 ${sex === opt ? 'bg-[#38BDF8]' : 'bg-[#141419]'}`}
                  >
                    <Text className={`text-center ${sex === opt ? 'text-[#050d12] font-semibold' : 'text-gray-400'}`}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="flex-row justify-between mb-6">
              <View className="flex-1 mr-2">
                <Text className="text-gray-400 mb-2">Height (cm)</Text>
                <TextInput 
                  className="bg-[#141419] text-white p-4 rounded-xl text-lg"
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-gray-400 mb-2">Weight (kg)</Text>
                <TextInput 
                  className="bg-[#141419] text-white p-4 rounded-xl text-lg"
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                />
              </View>
            </View>
          </Animated.View>
        );
      
      case 2:
        return (
          <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1 justify-center">
            <Text className="text-white text-3xl font-semibold mb-8 text-center">Sleep</Text>
            
            <View className="mb-8">
              <Text className="text-gray-400 mb-4">Average sleep per night: <Text className="text-white font-bold">{sleepHours}h</Text></Text>
              <Slider
                style={{width: '100%', height: 40}}
                minimumValue={4}
                maximumValue={10}
                step={0.5}
                value={sleepHours}
                onValueChange={setSleepHours}
                minimumTrackTintColor="#818CF8"
                maximumTrackTintColor="#141419"
                thumbTintColor="#818CF8"
              />
            </View>

            <View className="mb-8">
              <Text className="text-gray-400 mb-4">Sleep quality</Text>
              <Slider
                style={{width: '100%', height: 40}}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={sleepQuality}
                onValueChange={setSleepQuality}
                minimumTrackTintColor="#818CF8"
                maximumTrackTintColor="#141419"
                thumbTintColor="#818CF8"
              />
              <View className="flex-row justify-between px-2 mt-1">
                <Text className="text-gray-500 text-xs">Poor</Text>
                <Text className="text-gray-500 text-xs">Great</Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center bg-[#141419] p-4 rounded-xl">
              <Text className="text-gray-300 text-lg">Consistent sleep schedule?</Text>
              <Switch
                value={consistentSleep}
                onValueChange={setConsistentSleep}
                trackColor={{ false: '#3e3e3e', true: '#818CF8' }}
                thumbColor={consistentSleep ? '#fff' : '#f4f3f4'}
              />
            </View>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1 justify-center">
            <Text className="text-white text-3xl font-semibold mb-8 text-center">Movement</Text>
            
            <View className="mb-8">
              <Text className="text-gray-400 mb-4">Active days per week: <Text className="text-white font-bold">{activeDays}</Text></Text>
              <Slider
                style={{width: '100%', height: 40}}
                minimumValue={0}
                maximumValue={7}
                step={1}
                value={activeDays}
                onValueChange={setActiveDays}
                minimumTrackTintColor="#34D399"
                maximumTrackTintColor="#141419"
                thumbTintColor="#34D399"
              />
            </View>

            <View className="mb-8">
              <Text className="text-gray-400 mb-4">Typical daily steps: <Text className="text-white font-bold">{dailySteps}</Text></Text>
              <Slider
                style={{width: '100%', height: 40}}
                minimumValue={0}
                maximumValue={15000}
                step={500}
                value={dailySteps}
                onValueChange={setDailySteps}
                minimumTrackTintColor="#34D399"
                maximumTrackTintColor="#141419"
                thumbTintColor="#34D399"
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-400 mb-2">Type of activity</Text>
              <View className="flex-row flex-wrap justify-start">
                {['Walking', 'Gym', 'Cycling', 'Swimming', 'None'].map(opt => (
                  <TouchableOpacity 
                    key={opt}
                    onPress={() => toggleActivity(opt)}
                    className={`p-3 rounded-xl m-1 ${activityTypes.includes(opt) ? 'bg-[#34D399]' : 'bg-[#141419]'}`}
                  >
                    <Text className={`${activityTypes.includes(opt) ? 'text-[#050d12] font-semibold' : 'text-gray-400'}`}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>
        );

      case 4:
        return (
          <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1 justify-center">
            <Text className="text-white text-3xl font-semibold mb-8 text-center">Nutrition & Substances</Text>
            
            <View className="mb-8">
              <Text className="text-gray-400 mb-4">Diet quality</Text>
              <Slider
                style={{width: '100%', height: 40}}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={dietQuality}
                onValueChange={setDietQuality}
                minimumTrackTintColor="#FBBF24"
                maximumTrackTintColor="#141419"
                thumbTintColor="#FBBF24"
              />
              <View className="flex-row justify-between px-2 mt-1">
                <Text className="text-gray-500 text-xs">Fast Food</Text>
                <Text className="text-gray-500 text-xs">Whole Foods</Text>
              </View>
            </View>

            <View className="mb-8">
              <Text className="text-gray-400 mb-4">Alcohol consumption</Text>
              <Slider
                style={{width: '100%', height: 40}}
                minimumValue={0}
                maximumValue={3}
                step={1}
                value={alcohol}
                onValueChange={setAlcohol}
                minimumTrackTintColor="#FBBF24"
                maximumTrackTintColor="#141419"
                thumbTintColor="#FBBF24"
              />
              <View className="flex-row justify-between px-2 mt-1">
                <Text className="text-gray-500 text-xs">Never</Text>
                <Text className="text-gray-500 text-xs">Occasionally</Text>
                <Text className="text-gray-500 text-xs">Weekly</Text>
                <Text className="text-gray-500 text-xs">Daily</Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center bg-[#141419] p-4 rounded-xl">
              <Text className="text-gray-300 text-lg">Smoker?</Text>
              <Switch
                value={smoker}
                onValueChange={setSmoker}
                trackColor={{ false: '#3e3e3e', true: '#FBBF24' }}
                thumbColor={smoker ? '#fff' : '#f4f3f4'}
              />
            </View>
          </Animated.View>
        );

      case 5:
        return (
          <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1 justify-center">
            <Text className="text-white text-3xl font-semibold mb-8 text-center">Mind & Stress</Text>
            
            <View className="mb-8">
              <Text className="text-gray-400 mb-4">Average stress level</Text>
              <Slider
                style={{width: '100%', height: 40}}
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={stressLevel}
                onValueChange={setStressLevel}
                minimumTrackTintColor="#38BDF8"
                maximumTrackTintColor="#141419"
                thumbTintColor="#38BDF8"
              />
              <View className="flex-row justify-between px-2 mt-1">
                <Text className="text-gray-500 text-xs">Low</Text>
                <Text className="text-gray-500 text-xs">High</Text>
              </View>
            </View>

            <View className="mb-8">
              <Text className="text-gray-400 mb-4">How often do you feel overwhelmed?</Text>
              <Slider
                style={{width: '100%', height: 40}}
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={overwhelmed}
                onValueChange={setOverwhelmed}
                minimumTrackTintColor="#38BDF8"
                maximumTrackTintColor="#141419"
                thumbTintColor="#38BDF8"
              />
              <View className="flex-row justify-between px-2 mt-1">
                <Text className="text-gray-500 text-xs">Rarely</Text>
                <Text className="text-gray-500 text-xs">Almost always</Text>
              </View>
            </View>

            <View className="bg-[#141419] p-4 rounded-xl">
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-300 text-md flex-1 mr-4">Regular mindfulness or relaxation practice?</Text>
                <Switch
                  value={mindfulness}
                  onValueChange={setMindfulness}
                  trackColor={{ false: '#3e3e3e', true: '#38BDF8' }}
                  thumbColor={mindfulness ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>
          </Animated.View>
        );

      case 6:
        return (
          <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1 justify-center items-center">
            <Text className="text-white text-3xl font-semibold mb-4 text-center">Wearable Import</Text>
            <Text className="text-gray-400 text-center mb-10 px-4">
              "We'll pre-fill your answers with your real data. You can adjust anything afterwards."
            </Text>
            
            <TouchableOpacity 
              onPress={handleFinish}
              className="bg-white px-8 py-4 rounded-full flex-row items-center justify-center w-full max-w-xs mb-6 shadow-lg shadow-white/20"
            >
              <Text className="text-black font-semibold text-lg ml-2">Import from Apple Health</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleFinish}
              className="px-8 py-4 rounded-full border border-gray-600 w-full max-w-xs"
            >
              <Text className="text-gray-300 font-semibold text-lg text-center">Skip & Finish</Text>
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
      className="flex-1 bg-[#050d12]"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}>
        
        {/* Strategic Skip Button for Debugging */}
        <TouchableOpacity 
          onPress={skipOnboarding}
          className="absolute top-12 right-6 z-10 bg-[#141419] px-4 py-2 rounded-full"
        >
          <Text className="text-gray-500 font-medium">Skip Debug</Text>
        </TouchableOpacity>

        {/* Progress Bar */}
        <View className="flex-row h-1 bg-[#141419] mb-12 rounded-full overflow-hidden w-full max-w-xs self-center mt-12">
          <View 
            className="h-full bg-white rounded-full" 
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </View>

        {renderScreen()}

        {/* Navigation Buttons */}
        <View className="flex-row justify-between mt-12 mb-8">
          {step > 1 ? (
            <TouchableOpacity 
              onPress={() => setStep(step - 1)}
              className="py-4 px-6 rounded-full bg-[#141419]"
            >
              <Text className="text-gray-300 font-semibold">Back</Text>
            </TouchableOpacity>
          ) : <View style={{ width: 80 }} />}

          {step < 6 && (
            <TouchableOpacity 
              onPress={() => setStep(step + 1)}
              className="py-4 px-8 rounded-full bg-white shadow-lg shadow-white/20"
            >
              <Text className="text-[#050d12] font-semibold">Continue</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
