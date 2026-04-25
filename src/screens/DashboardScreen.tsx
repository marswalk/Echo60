import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { calculateBiologicalAge, determineSingleBestHabit } from '../utils/simulation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;
  route: RouteProp<RootStackParamList, 'Dashboard'>;
};

export default function DashboardScreen({ navigation, route }: Props) {
  const { profile, trajectories } = route.params;
  const bioAge = calculateBiologicalAge(profile);
  const bestHabit = determineSingleBestHabit(profile);
  
  const currentTraj = trajectories.find(t => t.type === 'current');

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]">
      <ScrollView className="px-6 pt-4 pb-20">
        
        {/* Bio Age Card */}
        <View className="bg-[#1E293B] rounded-3xl p-6 items-center mb-6 shadow-xl shadow-black/50 border border-[#334155]">
          <Text className="text-[#94A3B8] font-medium text-lg mb-2 uppercase tracking-widest">Biological Age</Text>
          <View className="flex-row items-baseline">
            <Text className="text-6xl font-bold text-white">{bioAge.toFixed(1)}</Text>
            <Text className="text-[#94A3B8] ml-2 text-xl">yrs</Text>
          </View>
          <Text className={`mt-2 font-medium ${bioAge > profile.age ? 'text-[#F43F5E]' : 'text-[#06B6D4]'}`}>
            {bioAge > profile.age 
              ? `Aging faster than chronological (${profile.age})` 
              : `Aging slower than chronological (${profile.age})`}
          </Text>
        </View>

        {/* 30 Year Forecast Summary */}
        <View className="bg-[#1E293B] rounded-3xl p-6 mb-6 border border-[#334155]">
          <Text className="text-xl font-bold text-white mb-4">30-Year Forecast</Text>
          <Text className="text-[#F8FAFC] leading-relaxed">
            Based on your current trajectory, at age {profile.age + 30}, your biological age will be <Text className="text-[#F43F5E] font-bold">{currentTraj?.finalBiologicalAge.toFixed(1)}</Text>.
          </Text>
          
          <View className="mt-4 pt-4 border-t border-[#334155]">
             <Text className="text-[#94A3B8] text-sm uppercase tracking-wider mb-2">The One Change Challenge</Text>
             <Text className="text-[#8B5CF6] font-medium text-lg italic">{bestHabit}</Text>
          </View>
        </View>

        {/* Chart Placeholder (Hackathon brevity: building complex charts requires chart-kit, which has massive deps. We'll use a stylized graphic) */}
        <View className="h-48 bg-[#1E293B] rounded-3xl mb-8 justify-center items-center border border-[#334155] overflow-hidden">
           <Text className="text-[#94A3B8] font-medium">[ Trajectory Chart Projection ]</Text>
           <View className="absolute bottom-0 w-full h-1/2 bg-[#8B5CF6]/10"></View>
           <View className="absolute bottom-4 left-4 w-3/4 h-1 bg-[#8B5CF6] rounded-full transform -rotate-12 origin-left"></View>
           <View className="absolute bottom-4 left-4 w-3/4 h-1 bg-[#F43F5E] rounded-full transform -rotate-6 origin-left"></View>
        </View>

        <TouchableOpacity 
          className="w-full bg-[#8B5CF6] py-4 rounded-2xl items-center shadow-lg shadow-purple-500/30 mb-4"
          onPress={() => navigation.navigate('Chat', { profile, trajectories })}
        >
          <Text className="text-white text-lg font-bold">Speak to Your Future Self</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="w-full bg-transparent border border-[#8B5CF6] py-4 rounded-2xl items-center"
          onPress={() => navigation.navigate('Letter', { profile, trajectories })}
        >
          <Text className="text-[#8B5CF6] text-lg font-bold">Read the Letter</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
