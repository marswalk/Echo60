import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { generateFutureLetters } from '../services/ai';
import { sendLetterEmail } from '../services/email';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Letter'>;
  route: RouteProp<RootStackParamList, 'Letter'>;
};

export default function LetterScreen({ route }: Props) {
  const { profile, trajectories } = route.params;
  const [loading, setLoading] = useState(true);
  const [letters, setLetters] = useState<{currentPathLetter: string, optimizedPathLetter: string} | null>(null);
  
  const [activeTab, setActiveTab] = useState<'current' | 'optimized'>('current');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const fetchLetters = async () => {
      const result = await generateFutureLetters(profile, trajectories);
      setLetters(result);
      setLoading(false);
    };
    fetchLetters();
  }, [profile, trajectories]);

  const handleSendEmail = async () => {
    if (!email || !letters) return;
    setSending(true);
    
    // We send whichever letter is currently selected
    const letterToSend = activeTab === 'current' ? letters.currentPathLetter : letters.optimizedPathLetter;
    
    const success = await sendLetterEmail(email, letterToSend);
    setSending(false);
    if (success) {
      setSent(true);
    } else {
      alert("Failed to send email. Check your API keys.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0F172A] justify-center items-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text className="text-[#94A3B8] mt-4">Receiving transmission from 2056...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]">
      {/* Tabs */}
      <View className="flex-row mx-4 mt-4 bg-[#1E293B] rounded-xl p-1 border border-[#334155]">
        <TouchableOpacity 
          className={`flex-1 py-3 rounded-lg items-center ${activeTab === 'current' ? 'bg-[#8B5CF6]' : 'bg-transparent'}`}
          onPress={() => setActiveTab('current')}
        >
          <Text className={`font-semibold ${activeTab === 'current' ? 'text-white' : 'text-[#94A3B8]'}`}>Current Path</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-3 rounded-lg items-center ${activeTab === 'optimized' ? 'bg-[#10B981]' : 'bg-transparent'}`}
          onPress={() => setActiveTab('optimized')}
        >
          <Text className={`font-semibold ${activeTab === 'optimized' ? 'text-white' : 'text-[#94A3B8]'}`}>Optimized Path</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 mt-6">
        <View className="bg-[#1E293B] p-6 rounded-2xl border border-[#334155] shadow-lg">
          <Text className="text-white text-lg leading-relaxed">
            {activeTab === 'current' ? letters?.currentPathLetter : letters?.optimizedPathLetter}
          </Text>
        </View>

        <View className="mt-8 mb-12">
          <Text className="text-white font-medium mb-2 text-center">Save this message</Text>
          <View className="flex-row bg-[#1E293B] rounded-xl border border-[#334155] overflow-hidden">
            <TextInput 
              className="flex-1 px-4 py-4 text-white"
              placeholder="Enter your email..."
              placeholderTextColor="#64748B"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TouchableOpacity 
              className="bg-[#8B5CF6] px-6 justify-center items-center"
              onPress={handleSendEmail}
              disabled={sending || sent || !email}
            >
              {sending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold">{sent ? 'Sent!' : 'Send'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
