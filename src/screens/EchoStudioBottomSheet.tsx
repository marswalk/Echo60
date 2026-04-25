import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import Svg, { Path, Line } from 'react-native-svg';
import { useProfile } from '../context/ProfileContext';
import { LoggingService } from '../services/LoggingService';

type Props = {
  visible: boolean;
  onClose: () => void;
  initialMessage?: string;
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

export default function EchoStudioBottomSheet({ visible, onClose, initialMessage }: Props) {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { addDailyLog, profile } = useProfile();
  
  const [messages, setMessages] = useState<{
    id: string; 
    role: 'user' | 'assistant'; 
    text: string;
    simulationImpact?: { projectedAge: number; label: string };
    baselineAge?: number;
  }[]>([]);

  const hour = new Date().getHours();
  let baseSuggestions = MORNING_SUGGESTIONS;
  if (hour >= 12 && hour < 17) baseSuggestions = AFTERNOON_SUGGESTIONS;
  else if (hour >= 17 || hour < 5) baseSuggestions = EVENING_SUGGESTIONS;

  const suggestions = [...baseSuggestions, ...baseSuggestions, ...baseSuggestions, ...baseSuggestions, ...baseSuggestions];

  // Auto-send initialMessage whenever the sheet opens with one
  const prevVisibleRef = React.useRef(false);
  useEffect(() => {
    if (visible && !prevVisibleRef.current) {
      setInputText('');
      setIsProcessing(false);
      // Seed greeting if conversation is fresh
      const seedMessages: typeof messages = messages.length === 0
        ? [{
            id: 'greeting',
            role: 'assistant' as const,
            text: `Hey ${profile?.name?.split(' ')[0] || 'there'}, how are you feeling? Log any activities, meals, or sleep.`
          }]
        : messages;

      if (initialMessage) {
        // Show greeting first, then immediately fire the question
        setMessages(seedMessages);
        // Small delay so the sheet is visually open before sending
        setTimeout(() => {
          handleAutoSend(initialMessage, seedMessages);
        }, 400);
      } else if (messages.length === 0) {
        setMessages(seedMessages);
      }
    }
    prevVisibleRef.current = visible;
  }, [visible]);

  /** Shared send logic, works with an arbitrary message and seed history. */
  const handleAutoSend = async (
    text: string,
    baseMessages: typeof messages
  ) => {
    if (!text.trim() || isProcessing) return;
    setIsProcessing(true);
    setMessages([...baseMessages, { id: Date.now().toString(), role: 'user', text }]);

    const todayDate = new Date().toISOString().split('T')[0];
    let baseEntry = profile?.data.find(d => d.date === todayDate) ?? {
      date: todayDate, sleep: undefined, heartRate: undefined,
      activity: 0, calories: 0, hrv: undefined, hydration: 0
    };
    const profileContext = profile ? `
Name: ${profile.name}
Biological Age: ${profile.age}
Echo60 Age (Predicted Age at 60): ${profile.bioAge}
Recent Metrics (Latest Day):
- Sleep: ${baseEntry.sleep || '--'} hours
- Heart Rate: ${baseEntry.heartRate || '--'} bpm
- Activity: ${baseEntry.activity || '0'} km
- HRV: ${baseEntry.hrv || '--'} ms
- Calories: ${baseEntry.calories || '0'} kcal
- Hydration: ${baseEntry.hydration || '0'} L
` : undefined;

    const response = await LoggingService.parseNaturalLanguageLog(text, profileContext);
    const updates = response.updates;
    if (updates && Object.keys(updates).length > 0) {
      await addDailyLog({ ...baseEntry, ...updates, date: todayDate });
    }
    const currentAge = profile?.bioAge || 60;
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: response.reply,
      simulationImpact: response.simulationImpact,
      baselineAge: currentAge
    }]);
    setIsProcessing(false);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isProcessing) return;
    const userText = inputText;
    setInputText('');
    await handleAutoSend(userText, messages);
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
              <View key={msg.id} className="mb-4">
                <View 
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-[#E0E7FF] self-end rounded-tr-sm' 
                      : 'bg-white/5 border border-white/10 self-start rounded-tl-sm'
                  }`}
                >
                  <Text className={`${msg.role === 'user' ? 'text-[#0A1118]' : 'text-white'} text-[15px] leading-5`}>
                    {msg.text}
                  </Text>
                </View>
                
                {/* Enhanced Simulation Impact Card */}
                {msg.simulationImpact && msg.baselineAge && (
                  <View className="mt-1 self-start bg-[#141A21] border border-[#2A3441] rounded-xl p-3 w-[80%] flex-col shadow-sm">
                    
                    {/* Header: Label */}
                    <View className="flex-row items-center mb-2">
                      <View className="bg-blue-500/20 w-6 h-6 rounded-full items-center justify-center mr-2">
                        <Text className="text-[10px]">🧬</Text>
                      </View>
                      <Text className="text-[#A0B0BA] text-[10px] font-semibold uppercase tracking-wider flex-1" numberOfLines={1}>
                        Impact: {msg.simulationImpact.label}
                      </Text>
                    </View>

                    {/* Body: Current -> New */}
                    <View className="flex-row items-center justify-between mb-3 px-1">
                      <View className="items-center">
                        <Text className="text-white text-lg font-bold leading-tight">{msg.baselineAge}</Text>
                        <Text className="text-[#6B7280] text-[8px] uppercase font-bold mt-0.5">Current</Text>
                      </View>
                      
                      <Text className="text-[#4B5563] text-sm">➔</Text>
                      
                      <View className="items-center">
                        <Text className={`text-lg font-bold leading-tight ${msg.simulationImpact.projectedAge < msg.baselineAge ? 'text-blue-400' : 'text-red-400'}`}>
                          {msg.simulationImpact.projectedAge}
                        </Text>
                        <Text className={`text-[8px] uppercase font-bold mt-0.5 ${msg.simulationImpact.projectedAge < msg.baselineAge ? 'text-blue-400/80' : 'text-red-400/80'}`}>Projected</Text>
                      </View>
                    </View>

                    {/* Chart Visualization */}
                    <View className="h-8 w-full rounded-md bg-[#0F1318] overflow-hidden justify-center border border-[#1A222B]">
                      <Svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                        {/* Baseline: Straight Grey Line */}
                        <Line x1="0" y1="20" x2="100" y2="20" stroke="#4B5563" strokeWidth="2" strokeDasharray="4 4" />
                        
                        {/* Dynamic Curve */}
                        {(() => {
                          const diff = msg.simulationImpact.projectedAge - msg.baselineAge;
                          const clampedDiff = Math.max(-10, Math.min(10, diff));
                          const targetY = 20 - (clampedDiff * 1.5); 
                          const color = diff < 0 ? '#60A5FA' : '#F87171';
                          
                          return (
                            <Path 
                              d={`M0 20 C40 20 60 ${targetY} 100 ${targetY}`} 
                              stroke={color} 
                              strokeWidth="3" 
                              fill="none" 
                            />
                          );
                        })()}
                      </Svg>
                    </View>

                  </View>
                )}
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
