import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TextInput, TouchableOpacity } from 'react-native';

export default function ProfileTab() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="px-4 pt-6">
        <Text className="text-text font-bold text-2xl mb-8 tracking-wide">Settings & Sync</Text>

        <View className="bg-surface rounded-[16px] overflow-hidden shadow-lg mb-8">
          {/* Row 1 */}
          <View className="flex-row justify-between items-center p-4 border-b border-textMuted/10">
            <Text className="text-text font-light text-lg">Apple Health Sync</Text>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-green-400 mr-2 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
              <Text className="text-green-400 text-sm">Connected</Text>
            </View>
          </View>

          {/* Row 2 */}
          <View className="flex-row justify-between items-center p-4 border-b border-textMuted/10">
            <Text className="text-text font-light text-lg">Local LLM Server</Text>
            <TextInput 
              className="text-textMuted text-right"
              placeholder="192.168.1.X"
              placeholderTextColor="#555"
              defaultValue="192.168.1.100"
            />
          </View>

          {/* Row 3 */}
          <View className="flex-row justify-between items-center p-4">
            <Text className="text-text font-light text-lg">Wearable Source</Text>
            <Text className="text-textMuted">Apple Watch</Text>
          </View>
        </View>

        <TouchableOpacity className="mt-8">
          <Text className="text-red-500 text-center font-medium text-lg">Reset Twin Data</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
