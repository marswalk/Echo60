import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { generateChatResponse } from '../services/ai';
import { ChatMessage } from '../types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Chat'>;
  route: RouteProp<RootStackParamList, 'Chat'>;
};

export default function ChatScreen({ route }: Props) {
  const { profile, trajectories } = route.params;
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello. I'm you, from the year ${new Date().getFullYear() + 30}. We need to talk about the path we're on.`,
      createdAt: new Date().toISOString(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Call AI
    const aiResponse = await generateChatResponse([...messages, userMsg], profile, trajectories);
    
    setIsTyping(false);
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse,
      createdAt: new Date().toISOString(),
    }]);
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View className={`mb-4 max-w-[80%] ${isUser ? 'self-end' : 'self-start'}`}>
        <View className={`p-4 rounded-2xl ${isUser ? 'bg-[#8B5CF6] rounded-tr-sm' : 'bg-[#1E293B] border border-[#334155] rounded-tl-sm'}`}>
          <Text className={`${isUser ? 'text-white' : 'text-[#F8FAFC]'}`}>{item.content}</Text>
        </View>
        <Text className={`text-xs text-[#64748B] mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {isUser ? 'You' : 'Future You'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]">
      <KeyboardAvoidingView 
        className="flex-1" 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          className="flex-1 px-4 py-6"
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        
        {isTyping && (
          <View className="px-4 py-2">
            <Text className="text-[#94A3B8] italic">Future You is typing...</Text>
          </View>
        )}

        <View className="p-4 bg-[#1E293B] flex-row items-center border-t border-[#334155]">
          <TextInput
            className="flex-1 bg-[#0F172A] text-white rounded-full px-5 py-3 border border-[#334155]"
            placeholder="Ask your future self a question..."
            placeholderTextColor="#64748B"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity 
            className={`ml-3 rounded-full w-12 h-12 items-center justify-center ${inputText.trim() ? 'bg-[#8B5CF6]' : 'bg-[#334155]'}`}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Text className="text-white font-bold">↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
