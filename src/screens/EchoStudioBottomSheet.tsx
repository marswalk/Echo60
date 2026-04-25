import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

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

  const hour = new Date().getHours();
  let baseSuggestions = MORNING_SUGGESTIONS;
  if (hour >= 12 && hour < 17) baseSuggestions = AFTERNOON_SUGGESTIONS;
  else if (hour >= 17 || hour < 5) baseSuggestions = EVENING_SUGGESTIONS;

  // Duplicate to create infinite scrolling illusion
  const suggestions = [...baseSuggestions, ...baseSuggestions, ...baseSuggestions, ...baseSuggestions, ...baseSuggestions];

  useEffect(() => {
    if (visible) {
      setInputText('');
    }
  }, [visible]);

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
            {/* Blank state for now */}
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
              autoFocus={true}
            />
            <TouchableOpacity className="ml-3 w-12 h-12 bg-[#E0E7FF] rounded-full items-center justify-center">
              <Text className="text-[#0A1118] font-bold text-lg">↑</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
