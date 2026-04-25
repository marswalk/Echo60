import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Switch } from 'react-native';

export default function FutureLabTab() {
  const [sleepToggle, setSleepToggle] = useState(false);
  const [waterToggle, setWaterToggle] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-background relative">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Text className="text-text font-bold text-2xl mx-4 mt-6 mb-8 tracking-wide">Simulation Sandbox</Text>

        {/* Top Half: Line Graph */}
        <View className="h-64 mx-4 bg-surface rounded-[16px] justify-center items-center overflow-hidden mb-8 shadow-lg">
          {/* Minimalist Line Graph visual representation */}
          <View className="absolute bottom-10 left-0 w-full h-px bg-textMuted/20" />
          
          {/* Baseline Line */}
          <View className="absolute bottom-10 left-0 w-full h-0.5 bg-textMuted/50 transform -rotate-2 origin-left" />
          
          {/* Simulated Line (glowing cyan if toggles active) */}
          <View className={`absolute bottom-10 left-0 w-full h-1 ${sleepToggle || waterToggle ? 'bg-primary shadow-[0_0_10px_rgba(0,255,255,0.8)]' : 'bg-primary/20'} transform -rotate-12 origin-left transition-all`} />
          
          <Text className="absolute top-4 left-4 text-textMuted text-xs uppercase tracking-widest">Health Over Time</Text>
        </View>

        {/* Bottom Half: Actionable Micro-habits */}
        <Text className="text-textMuted text-sm font-medium uppercase tracking-widest mx-4 mb-4">Simulate Habits</Text>
        
        <View className="mx-4 space-y-3">
          <View className="bg-surface p-4 rounded-[16px] flex-row items-center justify-between">
            <Text className="text-text font-light text-lg">+1 Hour of Sleep Tonight</Text>
            <Switch 
              value={sleepToggle} 
              onValueChange={setSleepToggle}
              trackColor={{ false: '#333333', true: '#00FFFF' }}
              thumbColor={'#FFFFFF'}
            />
          </View>
          
          <View className="bg-surface p-4 rounded-[16px] flex-row items-center justify-between">
            <Text className="text-text font-light text-lg">Drink 2L of Water</Text>
            <Switch 
              value={waterToggle} 
              onValueChange={setWaterToggle}
              trackColor={{ false: '#333333', true: '#00FFFF' }}
              thumbColor={'#FFFFFF'}
            />
          </View>
        </View>
      </ScrollView>

      {/* Absolute bottom pinned button */}
      <View className="absolute bottom-0 w-full p-6 bg-background">
        <TouchableOpacity className="w-full bg-primary py-4 rounded-[16px] items-center shadow-[0_0_20px_rgba(0,255,255,0.4)]">
          <Text className="text-black text-lg font-bold tracking-wide">Apply to My Future</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
