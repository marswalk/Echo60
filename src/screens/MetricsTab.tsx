import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import BackgroundGradient from '../components/BackgroundGradient';

type InlineBadgeProps = {
  emoji: string;
  label: string;
  accentClassName: string;
};

function InlineBadge({ emoji, label, accentClassName }: InlineBadgeProps) {
  return (
    <View className="bg-[#1C1C1E] border border-white/5 rounded-full px-3 py-1 flex-row items-center mx-1 my-1">
      <Text className="text-sm mr-1">{emoji}</Text>
      <Text className={accentClassName}>{label}</Text>
    </View>
  );
}

export default function MetricsTab() {
  return (
    <View className="flex-1">
      <BackgroundGradient>
        <SafeAreaView className="flex-1">
          <ScrollView className="px-5 pt-8" contentContainerStyle={{ paddingBottom: 120 }}>
            <View className="mb-10 flex-row flex-wrap items-center">
              <Text className="text-white text-base font-light leading-8">
                Your
              </Text>
              <InlineBadge emoji="😴" label="sleep 7.2h" accentClassName="text-[#00FFFF] text-sm font-medium" />
              <Text className="text-white text-base font-light leading-8">
                consistency has been excellent this week, lowering cortisol. However, your
              </Text>
              <InlineBadge emoji="🏃" label="activity 4.2km" accentClassName="text-[#EAB308] text-sm font-medium" />
              <Text className="text-white text-base font-light leading-8">
                has dipped—add 15 mins of walking today. Your
              </Text>
              <InlineBadge emoji="❤️" label="heart rate 68bpm" accentClassName="text-[#22C55E] text-sm font-medium" />
              <Text className="text-white text-base font-light leading-8">
                remains steady.
              </Text>
            </View>

            <Text className="text-[#A0B0BA] text-xs font-semibold tracking-[0.2em] uppercase mb-6">All Metrics</Text>

            <View className="flex-row flex-wrap justify-between">
              {/* Card 1: Sleep */}
              <View className="w-[48%] bg-white/5 p-5 rounded-[24px] mb-4 border border-white/10 shadow-sm">
                <View className="flex-row items-center mb-6">
                  <Text className="text-lg mr-2">😴</Text>
                  <Text className="text-[#A0B0BA] font-medium tracking-wide text-xs uppercase">Sleep</Text>
                </View>
                <View className="flex-row items-baseline mb-3">
                  <Text className="text-white font-thin tracking-tighter text-5xl">7.2</Text>
                  <Text className="text-[#A0B0BA] ml-1 text-xs font-medium">hrs</Text>
                </View>
                <Text className="text-[#22C55E] text-xs font-medium tracking-wide">↑ 5%</Text>
              </View>

              {/* Card 2: Heart Rate */}
              <View className="w-[48%] bg-white/5 p-5 rounded-[24px] mb-4 border border-white/10 shadow-sm">
                <View className="flex-row items-center mb-6">
                  <Text className="text-lg mr-2">❤️</Text>
                  <Text className="text-[#A0B0BA] font-medium tracking-wide text-xs uppercase">Heart Rate</Text>
                </View>
                <View className="flex-row items-baseline mb-3">
                  <Text className="text-white font-thin tracking-tighter text-5xl">68</Text>
                  <Text className="text-[#A0B0BA] ml-1 text-xs font-medium">bpm</Text>
                </View>
                <Text className="text-[#22C55E] text-xs font-medium tracking-wide">↓ 2%</Text>
              </View>

              {/* Card 3: Activity */}
              <View className="w-[48%] bg-white/5 p-5 rounded-[24px] mb-4 border border-white/10 shadow-sm">
                <View className="flex-row items-center mb-6">
                  <Text className="text-lg mr-2">🏃</Text>
                  <Text className="text-[#A0B0BA] font-medium tracking-wide text-xs uppercase">Activity</Text>
                </View>
                <View className="flex-row items-baseline mb-3">
                  <Text className="text-white font-thin tracking-tighter text-5xl">4.2</Text>
                  <Text className="text-[#A0B0BA] ml-1 text-xs font-medium">km</Text>
                </View>
                <Text className="text-[#EAB308] text-xs font-medium tracking-wide">↓ 15%</Text>
              </View>
              
              {/* Card 4: Calories */}
              <View className="w-[48%] bg-white/5 p-5 rounded-[24px] mb-4 border border-white/10 shadow-sm">
                <View className="flex-row items-center mb-6">
                  <Text className="text-lg mr-2">🔥</Text>
                  <Text className="text-[#A0B0BA] font-medium tracking-wide text-xs uppercase">Calories</Text>
                </View>
                <View className="flex-row items-baseline mb-3">
                  <Text className="text-white font-thin tracking-tighter text-5xl">2,340</Text>
                  <Text className="text-[#A0B0BA] ml-1 text-xs font-medium">kcal</Text>
                </View>
                <Text className="text-[#22C55E] text-xs font-medium tracking-wide">↑ 3%</Text>
              </View>

              {/* Card 5: HRV */}
              <View className="w-[48%] bg-white/5 p-5 rounded-[24px] mb-4 border border-white/10 shadow-sm">
                <View className="flex-row items-center mb-6">
                  <Text className="text-lg mr-2">🧘</Text>
                  <Text className="text-[#A0B0BA] font-medium tracking-wide text-xs uppercase">HRV</Text>
                </View>
                <View className="flex-row items-baseline mb-3">
                  <Text className="text-white font-thin tracking-tighter text-5xl">52</Text>
                  <Text className="text-[#A0B0BA] ml-1 text-xs font-medium">ms</Text>
                </View>
                <Text className="text-[#22C55E] text-xs font-medium tracking-wide">↑ 8%</Text>
              </View>

              {/* Card 6: Hydration */}
              <View className="w-[48%] bg-white/5 p-5 rounded-[24px] mb-4 border border-white/10 shadow-sm">
                <View className="flex-row items-center mb-6">
                  <Text className="text-lg mr-2">💧</Text>
                  <Text className="text-[#A0B0BA] font-medium tracking-wide text-xs uppercase">Hydration</Text>
                </View>
                <View className="flex-row items-baseline mb-3">
                  <Text className="text-white font-thin tracking-tighter text-5xl">1.8</Text>
                  <Text className="text-[#A0B0BA] ml-1 text-xs font-medium">L</Text>
                </View>
                <Text className="text-[#22C55E] text-xs font-medium tracking-wide">→ Same</Text>
              </View>

            </View>
          </ScrollView>
        </SafeAreaView>
      </BackgroundGradient>
    </View>
  );
}
