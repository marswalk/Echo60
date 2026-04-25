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
      <View className="flex-1 justify-end bg-black/50">
        <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="bg-surface rounded-t-3xl h-[70%] border-t border-primary/20 shadow-[0_-10px_40px_rgba(0,255,255,0.15)]"
        >
          {/* Drag Handle */}
          <View className="items-center py-4">
            <View className="w-12 h-1.5 bg-textMuted/30 rounded-full" />
          </View>

          {/* Chat Content */}
          <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 20 }}>
            
            {/* User Message */}
            <View className="self-end max-w-[80%] mb-4">
              <View className="bg-[#2C2C2E] p-4 rounded-2xl rounded-tr-sm">
                <Text className="text-text font-light text-[15px]">What happens if I start sleeping 8 hours a night?</Text>
              </View>
            </View>

            {/* AI Message */}
            <View className="self-start max-w-[85%] mb-4">
              <View className="bg-primary/10 border border-primary/20 p-4 rounded-2xl rounded-tl-sm">
                <Text className="text-text font-light text-[15px] mb-4 leading-relaxed">
                  If you sleep 8 hours consistently, your cardiovascular risk drops by 14% over the next decade. Your cognitive decline trajectory also flattens significantly.
                </Text>
                
                {/* Embed Action Pill */}
                <TouchableOpacity className="bg-background border border-primary py-2 px-4 rounded-full self-start flex-row items-center">
                  <Text className="text-primary font-medium mr-2">Apply to Simulation</Text>
                  <Text className="text-primary font-bold">→</Text>
                </TouchableOpacity>
              </View>
            </View>

          </ScrollView>

          {/* Input Area */}
          <View className="p-4 border-t border-textMuted/10 bg-surface flex-row items-center">
            <TextInput 
              className="flex-1 bg-background text-text px-4 py-3 rounded-full border border-textMuted/20"
              placeholder="Ask your digital twin..."
              placeholderTextColor="#8E8E93"
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity className="ml-3 w-10 h-10 bg-primary/20 rounded-full items-center justify-center border border-primary/50">
              <Text className="text-primary font-bold">↑</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
