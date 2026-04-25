import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import EchoStudioBottomSheet from './EchoStudioBottomSheet';

export default function EchoTab() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text className="text-text font-bold text-xl mb-12 text-center tracking-widest">
          Projected 2045: Biological Age <Text className="text-primary font-bold">55</Text>
        </Text>

        {/* Circular 3D Glowing Orb Placeholder */}
        <View className="w-64 h-64 rounded-full bg-surface items-center justify-center border border-primary/30 shadow-[0_0_40px_rgba(0,255,255,0.2)] mb-12">
          <Text className="text-textMuted text-sm">[ Abstract 3D Orb ]</Text>
        </View>

        {/* Upward Sparkline Placeholder */}
        <View className="w-32 h-12 border-b border-r border-primary/50 mb-4 justify-end">
           <View className="w-full h-1 bg-primary transform -rotate-12 origin-bottom-left shadow-[0_0_10px_rgba(0,255,255,0.5)]"></View>
        </View>

        <Text className="text-textMuted text-sm font-light mb-16">
          Trajectory: <Text className="text-text">Improving (+1.2 Vitality this week)</Text>
        </Text>

        <TouchableOpacity 
          className="bg-primary/10 border border-primary/50 py-4 px-8 rounded-full shadow-[0_0_15px_rgba(0,255,255,0.3)]"
          onPress={() => setIsChatOpen(true)}
        >
          <Text className="text-primary font-medium tracking-wide">✨ See what +1 hour of sleep does</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Chat UI Bottom Sheet Overlay */}
      <EchoStudioBottomSheet visible={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </SafeAreaView>
  );
}
