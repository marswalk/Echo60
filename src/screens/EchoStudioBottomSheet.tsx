import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useProfile } from '../context/ProfileContext';
import { LoggingService } from '../services/LoggingService';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const MORNING_SUGGESTIONS = [
  "Log 8 hours sleep",
  "What if I skip breakfast?",
  "Log 30m morning walk",
  "Explain glucose spike",
  "Log 2 cups water"
];

const AFTERNOON_SUGGESTIONS = [
  "Log salad for lunch",
  "Simulate afternoon coffee",
  "Why am I tired now?",
  "Log 20m stretching",
  "Explain cortisol dip"
];

const EVENING_SUGGESTIONS = [
  "Log 1 glass of wine",
  "Simulate late night snack",
  "Log 1hr reading",
  "What if I sleep at 2 AM?",
  "Log dinner: steak"
];

export default function EchoStudioBottomSheet({ visible, onClose }: Props) {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { addDailyLog, profile } = useProfile();
  
  const [messages, setMessages] = useState<{id: string, role: 'user' | 'assistant', text: string}[]>([]);

  const hour = new Date().getHours();
  let baseSuggestions = MORNING_SUGGESTIONS;
  if (hour >= 12 && hour < 17) baseSuggestions = AFTERNOON_SUGGESTIONS;
  else if (hour >= 17 || hour < 5) baseSuggestions = EVENING_SUGGESTIONS;

  const suggestions = [...baseSuggestions, ...baseSuggestions, ...baseSuggestions, ...baseSuggestions, ...baseSuggestions];

  useEffect(() => {
    if (visible) {
      setInputText('');
      setIsProcessing(false);
      // Initialize with a greeting if empty
      if (messages.length === 0) {
        setMessages([{
          id: 'greeting',
          role: 'assistant',
          text: `Hey ${profile?.name?.split(' ')[0] || 'there'}, how are you feeling? Log any activities, meals, or sleep.`
        }]);
      }
    }
  }, [visible, profile]);

  const handleSend = async () => {
    if (!inputText.trim() || isProcessing) return;
    
    const userText = inputText;
    setInputText('');
    setIsProcessing(true);
    
    // Add user message to UI
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText }]);
    
    // Process input text using LLM Stub
    const response = await LoggingService.parseNaturalLanguageLog(userText);
    const updates = response.updates;
    
    if (updates && Object.keys(updates).length > 0) {
      // Find today's date or the last log date to append to
      const todayDate = new Date().toISOString().split('T')[0];
      const baseEntry = profile?.data.find(d => d.date === todayDate) || profile?.data[profile.data.length - 1] || {
        date: todayDate, sleep: 7, heartRate: 65, activity: 5, calories: 2000, hrv: 50, hydration: 2
      };
      
      await addDailyLog({ ...baseEntry, ...updates, date: todayDate });
    }
    
    // Always show the AI's contextual reply
    setMessages(prev => [...prev, { 
      id: (Date.now() + 1).toString(), 
      role: 'assistant', 
      text: response.reply
    }]);
    
    setIsProcessing(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="bg-[#1C2026] rounded-t-[40px] h-[75%] border-t border-white/10 shadow-2xl"
        >
          {/* Drag Handle */}
          <View className="items-center py-4">
            <View className="w-12 h-1.5 bg-white/20 rounded-full" />
          </View>

          {/* Chat Content */}
          <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 20 }}>
            {messages.map((msg) => (
              <View 
                key={msg.id} 
                className={`mb-4 max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-[#E0E7FF] self-end rounded-tr-sm' 
                    : 'bg-white/5 border border-white/10 self-start rounded-tl-sm'
                }`}
              >
                <Text className={`${msg.role === 'user' ? 'text-[#0A1118]' : 'text-white'} text-[15px] leading-5`}>
                  {msg.text}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Suggestions Area */}
          <View className="pb-3 border-t border-white/5 pt-3">
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              <View className="flex-col gap-2">
                <View className="flex-row gap-2">
                  {suggestions.slice(0, Math.ceil(suggestions.length / 2)).map((text, i) => (
                    <TouchableOpacity 
                      key={i} 
                      className="bg-white/5 border border-white/10 px-4 py-2 rounded-full"
                      onPress={() => setInputText(text)}
                    >
                      <Text className="text-[#A0B0BA] text-sm">{text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View className="flex-row gap-2 ml-6">
                  {suggestions.slice(Math.ceil(suggestions.length / 2)).map((text, i) => (
                    <TouchableOpacity 
                      key={i} 
                      className="bg-white/5 border border-white/10 px-4 py-2 rounded-full"
                      onPress={() => setInputText(text)}
                    >
                      <Text className="text-[#A0B0BA] text-sm">{text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>

          {/* Input Area */}
          <View className="p-5 pt-2 bg-transparent flex-row items-center">
            <TextInput 
              className="flex-1 bg-surfaceHighlight text-text px-5 py-4 rounded-full border border-white/10"
              placeholder="Ask your digital twin..."
              placeholderTextColor="#A0B0BA"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              autoFocus={true}
              editable={!isProcessing}
            />
            <TouchableOpacity 
              className="ml-3 w-12 h-12 bg-[#E0E7FF] rounded-full items-center justify-center opacity-90"
              onPress={handleSend}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#0A1118" />
              ) : (
                <Text className="text-[#0A1118] font-bold text-lg">↑</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
