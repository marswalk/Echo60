import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import BackgroundGradient from '../components/BackgroundGradient';
import Slider from '@react-native-community/slider';

export default function FutureLabTab() {
  const [sleepHours, setSleepHours] = useState(7);
  const [fastFood, setFastFood] = useState(3);
  const [smoking, setSmoking] = useState(0);

  // Dynamic Age Calculation
  const baseAge = 55;
  const sleepPenalty = sleepHours < 8 ? (8 - sleepHours) * 1.5 : -1.0;
  const foodPenalty = fastFood * 0.8;
  const smokePenalty = smoking * 1.2;
  
  const predictedAge = Math.round((baseAge + sleepPenalty + foodPenalty + smokePenalty) * 10) / 10;

  return (
    <View className="flex-1">
      <BackgroundGradient>
        <SafeAreaView className="flex-1">
          <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
            
            {/* Top Half: Dynamic Dashboard */}
            <View className="h-64 mx-4 justify-center items-center overflow-hidden mb-8 mt-10 bg-white/5 rounded-[32px] border border-white/10">
              
              <Text className="text-[#A0B0BA] text-xs font-semibold tracking-[0.2em] uppercase mb-2">Simulated Bio Age</Text>
              
              <View className="flex-row items-baseline mb-4">
                <Text className="text-white text-[80px] font-thin tracking-tighter leading-none">{Math.floor(predictedAge)}</Text>
                <Text className="text-white text-3xl font-thin">.{(predictedAge % 1).toFixed(1).substring(2)}</Text>
              </View>

              <View className="flex-row items-center space-x-2">
                <Text className="text-[#A0B0BA] font-light">Baseline: 55.0</Text>
                <Text className="text-white/20">|</Text>
                <Text className={predictedAge > baseAge ? "text-red-400 font-medium" : "text-[#00FFFF] font-medium"}>
                  {predictedAge > baseAge ? '+' : ''}{(predictedAge - baseAge).toFixed(1)} Years
                </Text>
              </View>

            </View>

            {/* Micro-Habits Section */}
            <Text className="text-[#A0B0BA] text-xs font-semibold tracking-[0.2em] uppercase mx-5 mb-4">Micro-Habits</Text>
            
            <View className="flex-row flex-wrap justify-between px-5 mb-10">
              <TouchableOpacity className="w-[48%] bg-white/5 border border-white/10 py-4 rounded-2xl items-center mb-3">
                <Text className="text-white font-medium text-sm tracking-wide">Meditation</Text>
              </TouchableOpacity>
              <TouchableOpacity className="w-[48%] bg-white/5 border border-white/10 py-4 rounded-2xl items-center mb-3">
                <Text className="text-white font-medium text-sm tracking-wide">Cold Shower</Text>
              </TouchableOpacity>
              <TouchableOpacity className="w-[48%] bg-white/5 border border-white/10 py-4 rounded-2xl items-center">
                <Text className="text-white font-medium text-sm tracking-wide">Morning Walk</Text>
              </TouchableOpacity>
              <TouchableOpacity className="w-[48%] bg-white/5 border border-white/10 py-4 rounded-2xl items-center">
                <Text className="text-white font-medium text-sm tracking-wide">Hydration</Text>
              </TouchableOpacity>
            </View>

            {/* Lifestyle Factors Section */}
            <Text className="text-[#A0B0BA] text-xs font-semibold tracking-[0.2em] uppercase mx-5 mb-4">Lifestyle Factors</Text>
            
            <View className="px-5 space-y-4">
              
              {/* Slider 1 */}
              <View className="bg-white/5 p-6 rounded-[24px] border border-white/10">
                <View className="flex-row justify-between mb-4 items-center">
                  <Text className="text-white font-medium tracking-wide">Sleep Hours</Text>
                  <Text className="text-[#00FFFF] font-bold text-base">{sleepHours}h</Text>
                </View>
                <Slider
                  style={{ width: '100%', height: 20 }}
                  minimumValue={0}
                  maximumValue={12}
                  step={1}
                  value={sleepHours}
                  onValueChange={setSleepHours}
                  minimumTrackTintColor="#00FFFF"
                  maximumTrackTintColor="rgba(255,255,255,0.1)"
                  thumbTintColor="#FFFFFF"
                />
              </View>

              {/* Slider 2 */}
              <View className="bg-white/5 p-6 rounded-[24px] border border-white/10">
                <View className="flex-row justify-between mb-4 items-center">
                  <Text className="text-white font-medium tracking-wide">Fast Food (days/week)</Text>
                  <Text className="text-[#EAB308] font-bold text-base">{fastFood}</Text>
                </View>
                <Slider
                  style={{ width: '100%', height: 20 }}
                  minimumValue={0}
                  maximumValue={7}
                  step={1}
                  value={fastFood}
                  onValueChange={setFastFood}
                  minimumTrackTintColor="#EAB308"
                  maximumTrackTintColor="rgba(255,255,255,0.1)"
                  thumbTintColor="#FFFFFF"
                />
              </View>

              {/* Slider 3 */}
              <View className="bg-white/5 p-6 rounded-[24px] border border-white/10">
                <View className="flex-row justify-between mb-4 items-center">
                  <Text className="text-white font-medium tracking-wide">Smoking (cigs/day)</Text>
                  <Text className="text-[#EF4444] font-bold text-base">{smoking}</Text>
                </View>
                <Slider
                  style={{ width: '100%', height: 20 }}
                  minimumValue={0}
                  maximumValue={20}
                  step={1}
                  value={smoking}
                  onValueChange={setSmoking}
                  minimumTrackTintColor="#EF4444"
                  maximumTrackTintColor="rgba(255,255,255,0.1)"
                  thumbTintColor="#FFFFFF"
                />
              </View>

            </View>

          </ScrollView>
        </SafeAreaView>
      </BackgroundGradient>
    </View>
  );
}
