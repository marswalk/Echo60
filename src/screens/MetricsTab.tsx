import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';

export default function MetricsTab() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="px-4 pt-6">
        <Text className="text-text font-bold text-2xl mb-6 tracking-wide">Metrics</Text>

        <View className="bg-surface p-5 rounded-[16px] shadow-lg mb-8">
          <Text className="text-text font-light leading-relaxed">
            Your sleep consistency has been excellent this week, lowering cortisol. However, your cardiovascular activity has dipped—add 15 mins of walking today.
          </Text>
        </View>

        <View className="flex-row flex-wrap justify-between">
          {/* Card 1 */}
          <View className="w-[48%] bg-surface p-4 rounded-[16px] mb-4 shadow-lg">
            <View className="flex-row items-center mb-4">
              <Text className="text-xl mr-2">🌙</Text>
              <Text className="text-textMuted font-medium text-xs tracking-wider uppercase">Sleep</Text>
            </View>
            <View className="flex-row items-baseline mb-4">
              <Text className="text-text font-bold text-4xl">7.2</Text>
              <Text className="text-textMuted ml-1 text-sm">hr</Text>
            </View>
            <Text className="text-primary text-xs font-light">↑ 5% from yesterday</Text>
          </View>

          {/* Card 2 */}
          <View className="w-[48%] bg-surface p-4 rounded-[16px] mb-4 shadow-lg">
            <View className="flex-row items-center mb-4">
              <Text className="text-xl mr-2">❤️</Text>
              <Text className="text-textMuted font-medium text-xs tracking-wider uppercase">Heart Rate</Text>
            </View>
            <View className="flex-row items-baseline mb-4">
              <Text className="text-text font-bold text-4xl">68</Text>
              <Text className="text-textMuted ml-1 text-sm">bpm</Text>
            </View>
            <Text className="text-red-400 text-xs font-light">↓ 2% from yesterday</Text>
          </View>

          {/* Card 3 */}
          <View className="w-[48%] bg-surface p-4 rounded-[16px] mb-4 shadow-lg">
            <View className="flex-row items-center mb-4">
              <Text className="text-xl mr-2">🏃</Text>
              <Text className="text-textMuted font-medium text-xs tracking-wider uppercase">Activity</Text>
            </View>
            <View className="flex-row items-baseline mb-4">
              <Text className="text-text font-bold text-4xl">45</Text>
              <Text className="text-textMuted ml-1 text-sm">min</Text>
            </View>
            <Text className="text-red-400 text-xs font-light">↓ 10% from yesterday</Text>
          </View>
          
          {/* Card 4 */}
          <View className="w-[48%] bg-surface p-4 rounded-[16px] mb-4 shadow-lg">
            <View className="flex-row items-center mb-4">
              <Text className="text-xl mr-2">🧠</Text>
              <Text className="text-textMuted font-medium text-xs tracking-wider uppercase">Stress</Text>
            </View>
            <View className="flex-row items-baseline mb-4">
              <Text className="text-text font-bold text-4xl">Low</Text>
            </View>
            <Text className="text-primary text-xs font-light">Stable</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
