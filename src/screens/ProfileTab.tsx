import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import BackgroundGradient from '../components/BackgroundGradient';

export default function ProfileTab() {
  return (
    <View className="flex-1">
      <BackgroundGradient>
        <SafeAreaView className="flex-1">
          <ScrollView className="px-4 pt-6" contentContainerStyle={{ paddingBottom: 120 }}>
            <Text className="text-text font-bold text-2xl mb-8 tracking-wide">Profil</Text>

            <View className="bg-surface rounded-3xl overflow-hidden border border-white/10 mb-8">
              {/* Row 1 */}
              <View className="flex-row justify-between items-center p-5 border-b border-white/5">
                <Text className="text-text font-light text-lg">Apple Health Sync</Text>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-green-400 mr-2 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                  <Text className="text-green-400 text-sm">Connected</Text>
                </View>
              </View>

              {/* Row 2 */}
              <View className="flex-row justify-between items-center p-5 border-b border-white/5">
                <Text className="text-text font-light text-lg">Local LLM Server</Text>
                <TextInput 
                  className="text-textMuted text-right"
                  placeholder="192.168.1.X"
                  placeholderTextColor="#888"
                  defaultValue="192.168.1.100"
                />
              </View>

              {/* Row 3 */}
              <View className="flex-row justify-between items-center p-5">
                <Text className="text-text font-light text-lg">Wearable Source</Text>
                <Text className="text-textMuted">Oura Ring</Text>
              </View>
            </View>

            <TouchableOpacity className="mt-8 bg-surface rounded-full py-4 border border-white/10">
              <Text className="text-red-400 text-center font-light text-lg">Reset Twin Data</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </BackgroundGradient>
    </View>
  );
}
