import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { LinearGradient } from 'expo-linear-gradient'; // Requires expo-linear-gradient but we'll mock if not installed. Let's stick to generic views.

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Welcome'>;
};

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-[#0F172A] justify-between items-center px-6 py-12">
      <View className="flex-1 justify-center items-center mt-12 w-full">
        <View className="w-32 h-32 rounded-full bg-[#1E293B] items-center justify-center border-4 border-[#8B5CF6] mb-8 shadow-lg shadow-purple-500/50">
          <Text className="text-5xl font-bold text-white">E60</Text>
        </View>
        <Text className="text-4xl font-bold text-white text-center tracking-tight mb-4">
          Meet Your <Text className="text-[#8B5CF6]">Future</Text>
        </Text>
        <Text className="text-lg text-[#94A3B8] text-center px-4 leading-relaxed">
          Echo60 analyzes your daily habits to simulate your biological age and connects you with your digital twin 30 years from now.
        </Text>
      </View>

      <TouchableOpacity 
        className="w-full bg-[#8B5CF6] py-4 rounded-2xl items-center shadow-lg shadow-purple-500/30"
        onPress={() => navigation.navigate('Questionnaire')}
        activeOpacity={0.8}
      >
        <Text className="text-white text-xl font-bold">Begin Simulation</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
