import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { initHealthKit, getHealthDataForToday } from '../services/healthKit';
import { calculateTrajectories } from '../utils/simulation';
import { HealthProfile } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Questionnaire'>;
};

export default function QuestionnaireScreen({ navigation }: Props) {
  const [age, setAge] = useState('30');
  const [sleep, setSleep] = useState('7');
  const [exercise, setExercise] = useState('3');
  const [diet, setDiet] = useState('5');
  const [stress, setStress] = useState('5');
  
  const [loadingHealthKit, setLoadingHealthKit] = useState(false);
  const [healthData, setHealthData] = useState<{ stepCount?: number } | null>(null);

  const handleImportHealth = async () => {
    setLoadingHealthKit(true);
    const hasPermissions = await initHealthKit();
    if (hasPermissions) {
      const data = await getHealthDataForToday();
      setHealthData(data);
    } else {
      alert("Could not get HealthKit permissions");
    }
    setLoadingHealthKit(false);
  };

  const handleCalculate = () => {
    const profile: HealthProfile = {
      age: parseInt(age) || 30,
      sleepHours: parseFloat(sleep) || 7,
      exerciseFrequency: parseInt(exercise) || 0,
      dietQuality: parseInt(diet) || 5,
      stressLevel: parseInt(stress) || 5,
      ...healthData
    };

    const trajectories = calculateTrajectories(profile);
    navigation.navigate('Dashboard', { profile, trajectories });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]">
      <ScrollView className="px-6 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
        
        <View className="mb-8">
          <Text className="text-2xl font-bold text-white mb-2">Initialize Profile</Text>
          <Text className="text-[#94A3B8]">To calculate your trajectory, we need some baselines.</Text>
        </View>

        <TouchableOpacity 
          className="w-full bg-[#1E293B] border border-[#06B6D4] py-4 rounded-xl flex-row justify-center items-center mb-8 shadow-sm shadow-[#06B6D4]/20"
          onPress={handleImportHealth}
        >
          {loadingHealthKit ? (
            <ActivityIndicator color="#06B6D4" />
          ) : (
            <Text className="text-[#06B6D4] font-semibold text-lg">Import Apple Health Data</Text>
          )}
        </TouchableOpacity>

        {healthData?.stepCount !== undefined && (
          <View className="bg-[#1E293B] p-4 rounded-xl mb-6 border border-green-500/30">
            <Text className="text-green-400 font-bold">HealthKit Synced!</Text>
            <Text className="text-[#94A3B8] mt-1">Steps Today: {healthData.stepCount}</Text>
          </View>
        )}

        <View className="space-y-6">
          <View>
            <Text className="text-white font-medium mb-2">Chronological Age</Text>
            <TextInput 
              className="bg-[#1E293B] text-white px-4 py-3 rounded-lg border border-[#334155]"
              keyboardType="number-pad"
              value={age}
              onChangeText={setAge}
              placeholderTextColor="#475569"
            />
          </View>
          <View>
            <Text className="text-white font-medium mb-2">Sleep (Hours/night)</Text>
            <TextInput 
              className="bg-[#1E293B] text-white px-4 py-3 rounded-lg border border-[#334155]"
              keyboardType="decimal-pad"
              value={sleep}
              onChangeText={setSleep}
            />
          </View>
          <View>
            <Text className="text-white font-medium mb-2">Exercise (Days/week)</Text>
            <TextInput 
              className="bg-[#1E293B] text-white px-4 py-3 rounded-lg border border-[#334155]"
              keyboardType="number-pad"
              value={exercise}
              onChangeText={setExercise}
            />
          </View>
          <View>
            <Text className="text-white font-medium mb-2">Diet Quality (1-10)</Text>
            <TextInput 
              className="bg-[#1E293B] text-white px-4 py-3 rounded-lg border border-[#334155]"
              keyboardType="number-pad"
              value={diet}
              onChangeText={setDiet}
            />
          </View>
          <View>
            <Text className="text-white font-medium mb-2">Stress Level (1-10)</Text>
            <TextInput 
              className="bg-[#1E293B] text-white px-4 py-3 rounded-lg border border-[#334155]"
              keyboardType="number-pad"
              value={stress}
              onChangeText={setStress}
            />
          </View>
        </View>

      </ScrollView>

      <View className="absolute bottom-0 w-full p-6 bg-[#0F172A] border-t border-[#1E293B]">
        <TouchableOpacity 
          className="w-full bg-[#8B5CF6] py-4 rounded-2xl items-center shadow-lg shadow-purple-500/30"
          onPress={handleCalculate}
        >
          <Text className="text-white text-xl font-bold">Calculate Future</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
