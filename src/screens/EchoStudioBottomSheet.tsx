import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function EchoStudioBottomSheet({ visible, onClose }: Props) {
  const [inputText, setInputText] = useState('');

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
            
            {/* User Message */}
            <View className="self-end max-w-[80%] mb-4 mt-4">
              <View className="bg-surfaceHighlight p-4 rounded-3xl rounded-tr-sm">
                <Text className="text-text font-light text-[15px]">What happens if I start sleeping 8 hours a night?</Text>
              </View>
            </View>

            {/* AI Message */}
            <View className="self-start max-w-[85%] mb-4">
              <View className="bg-transparent border border-white/10 p-5 rounded-3xl rounded-tl-sm">
                <Text className="text-text font-light text-[15px] mb-4 leading-relaxed">
                  If you sleep 8 hours consistently, your cardiovascular risk drops by 14% over the next decade. Your cognitive decline trajectory also flattens significantly.
                </Text>
                
                {/* Embed Action Pill */}
                <TouchableOpacity className="bg-white/10 border border-white/20 py-2 px-4 rounded-full self-start flex-row items-center">
                  <Text className="text-text font-medium mr-2">Apply to Simulation</Text>
                  <Text className="text-text font-bold">→</Text>
                </TouchableOpacity>
              </View>
            </View>

          </ScrollView>

          {/* Input Area */}
          <View className="p-5 border-t border-white/5 bg-transparent flex-row items-center">
            <TextInput 
              className="flex-1 bg-surfaceHighlight text-text px-5 py-4 rounded-full border border-white/10"
              placeholder="Ask your digital twin..."
              placeholderTextColor="#A0B0BA"
              value={inputText}
              onChangeText={setInputText}
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
