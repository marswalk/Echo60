import React, { useState, useRef, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import EchoStudioBottomSheet from './EchoStudioBottomSheet';
import BackgroundGradient from '../components/BackgroundGradient';
import { WebView } from 'react-native-webview';

const orbHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body, html {
      margin: 0; padding: 0;
      width: 100%; height: 100%;
      background: transparent;
      overflow: hidden;
    }
    .orb-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background: transparent;
    }
    .sphere {
      position: relative;
      border-radius: 50%;
      width: 200px;
      height: 200px;
      background: rgba(0,0,0,0.15);
      backdrop-filter: blur(5px);
      box-shadow: 0 0 50px 5px rgba(0,0,0,0.5), inset 0 0 40px rgba(255,255,255,0.5), inset 0 -20px 50px rgba(0,0,0,0.2);
      overflow: hidden;
      animation: float 6s ease-in-out infinite;
      flex-shrink: 0;
    }
    .sphere::before {
      content: '';
      position: absolute;
      top: 45%; left: 47%;
      transform: translate(-50%, -50%);
      width: 10px; height: 30px;
      background: rgba(255,255,255,1);
      border-radius: 3px;
      box-shadow: 30px 0 0 rgba(255,255,255,1);
      z-index: 60;
      animation: blink 4s infinite, lookAround 10s infinite ease-in-out;
    }
    .sphere::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 50%;
      animation: glowPulse 2s ease-in-out infinite;
    }
    .lava {
      position: absolute;
      inset: 5px;
      border-radius: 50%;
      filter: blur(25px);
      animation: colorShift 20s infinite linear;
      mix-blend-mode: screen;
    }
    .lava::before {
      content: '';
      position: absolute;
      width: 120%; height: 120%;
      background: radial-gradient(circle at 30% 30%, #0066ff 0%, transparent 45%),
                  radial-gradient(circle at 70% 30%, #ff00cc 0%, transparent 45%),
                  radial-gradient(circle at 50% 60%, #00ff99 0%, transparent 45%),
                  radial-gradient(circle at 80% 40%, #ff3300 0%, transparent 45%);
      filter: blur(8px);
      mix-blend-mode: screen;
    }
    .lava::after {
      content: '';
      position: absolute;
      width: 120%; height: 120%;
      background: radial-gradient(circle at 40% 40%, #0066ff 0%, transparent 35%),
                  radial-gradient(circle at 60% 40%, #ff00cc 0%, transparent 35%),
                  radial-gradient(circle at 50% 70%, #00ff99 0%, transparent 35%),
                  radial-gradient(circle at 70% 50%, #ff3300 0%, transparent 35%);
      filter: blur(12px);
      mix-blend-mode: screen;
      animation: pulse 4s ease-in-out infinite alternate;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    @keyframes blink {
      0%, 96% { height: 30px; }
      98% { height: 3px; }
      100% { height: 30px; }
    }
    @keyframes lookAround {
      0%, 40% { left: 47%; box-shadow: 30px 0 0 rgba(255,255,255,1); }
      45%, 55% { left: 40%; box-shadow: 30px 0 0 rgba(255,255,255,1); }
      60%, 70% { left: 54%; box-shadow: 30px 0 0 rgba(255,255,255,1); }
      75%, 100% { left: 47%; box-shadow: 30px 0 0 rgba(255,255,255,1); }
    }
    @keyframes colorShift {
      0% { filter: blur(25px) hue-rotate(0deg); }
      100% { filter: blur(25px) hue-rotate(360deg); }
    }
    @keyframes glowPulse {
      0%, 100% { box-shadow: 0 0 60px rgba(255,255,255,0.1); }
      50% { box-shadow: 0 0 85px rgba(255,255,255,0.2); }
    }
    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.9; }
      100% { transform: scale(1.15); opacity: 1; }
    }
  </style>
</head>
<body>
  <div class="orb-wrap">
    <div class="sphere">
      <div class="lava"></div>
    </div>
  </div>
</body>
</html>
`;

// A native-safe wrapper for Web iframes to avoid TS/rendering errors
const WebIframe = ({ html }: { html: string }) => {
  if (Platform.OS === 'web') {
    return React.createElement('iframe', {
      srcDoc: html,
      style: { width: 320, height: 320, border: 0, backgroundColor: 'transparent', pointerEvents: 'none' },
    });
  }
  return null;
};

let hasLaunched = false;

const MORNING_PROMPTS = [
  "I drank 2 cups of water...",
  "Did my morning run...",
  "What if I sleep 8 hours?",
  "Log my breakfast..."
];
const AFTERNOON_PROMPTS = [
  "Had a heavy lunch...",
  "Did 20 mins of yoga...",
  "How will this affect my glucose?",
  "Log afternoon coffee..."
];
const EVENING_PROMPTS = [
  "I had 2 glasses of wine...",
  "Read a book for 30 mins...",
  "Simulate late night snack...",
  "Log my dinner..."
];

export default function EchoTab() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [step, setStep] = useState(0); // 0: greeting, 1: bio age, 2: echo60 age
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const hour = new Date().getHours();
  let currentPrompts = MORNING_PROMPTS;
  if (hour >= 12 && hour < 17) currentPrompts = AFTERNOON_PROMPTS;
  else if (hour >= 17 || hour < 5) currentPrompts = EVENING_PROMPTS;

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex(prev => (prev + 1) % currentPrompts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [currentPrompts.length]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const initialStep = hasLaunched ? 1 : 0;
      setStep(initialStep);

      const runSequence = async () => {
        const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

        if (initialStep === 0) {
          // Greeting
          await wait(1500);
          if (!isMounted) return;
          hasLaunched = true;
          setStep(1);
        }

        if (!isMounted) return;

        // Bio Age
        await wait(2000);
        if (!isMounted) return;
        setStep(2);
      };

      runSequence();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  return (
    <View className="flex-1">
      <BackgroundGradient>
        <SafeAreaView className="flex-1">
          <ScrollView 
            contentContainerStyle={{ 
              flexGrow: 1, 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              paddingTop: 60, 
              paddingBottom: 120 
            }}
            showsVerticalScrollIndicator={false}
          >
            
            {/* Top Sequence Area */}
            <View className="h-[220px] w-full items-center justify-center">
              <View className="items-center w-full">
                
                {step === 0 && (
                  <Text className="text-[#00FFFF] text-3xl font-light tracking-wide text-center">Hello Sixel,</Text>
                )}

                {step === 1 && (
                  <View className="items-center w-full">
                    <Text className="text-[#A0B0BA] text-sm tracking-[0.2em] uppercase mb-2 font-semibold text-center">You're currently biologically</Text>
                    <Text className="text-white text-[90px] font-thin tracking-tighter leading-none shadow-[0_0_20px_rgba(255,255,255,0.3)]">32</Text>
                  </View>
                )}

                {step === 2 && (
                  <View className="items-center w-full">
                    <Text className="text-[#A0B0BA] text-sm tracking-[0.3em] uppercase mb-2 font-semibold text-center">Your Echo60 Age</Text>
                    <Text className="text-[#00FFFF] text-[110px] font-thin tracking-tighter leading-none shadow-[0_0_20px_rgba(0,255,255,0.3)]">55</Text>
                    
                    {/* Trajectory Text */}
                    <View className="flex-row items-center mt-6">
                      <Text className="text-[#00FFFF] text-xl mr-2 font-bold">↗</Text>
                      <Text className="text-[#A0B0BA] text-sm font-light tracking-wide">
                        Trajectory: <Text className="text-[#00FFFF] font-medium">Improving</Text> <Text className="text-white/60 text-xs">(+1.2 Vitality)</Text>
                      </Text>
                    </View>
                  </View>
                )}

              </View>
            </View>

            {/* The Animated Lava Orb */}
            <View className="relative w-80 h-80 items-center justify-center my-4">
              {Platform.OS === 'web' ? (
                <WebIframe html={orbHtml} />
              ) : (
                <WebView 
                  source={{ html: orbHtml }}
                  style={{ width: 320, height: 320, backgroundColor: 'transparent' }}
                  scrollEnabled={false}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  pointerEvents="none"
                />
              )}
            </View>

            {/* Faux Input Box */}
            <TouchableOpacity 
              className="bg-surfaceHighlight py-4 px-6 rounded-full border border-white/10 w-[90%] shadow-lg mt-8 flex-row items-center justify-between"
              activeOpacity={0.8}
              onPress={() => setIsChatOpen(true)}
            >
              <Text className="text-[#A0B0BA] font-light text-[15px] flex-1">
                {currentPrompts[placeholderIndex]}
              </Text>
              <View className="ml-3 w-10 h-10 bg-[#E0E7FF]/20 rounded-full items-center justify-center">
                <Text className="text-white font-bold text-sm">↑</Text>
              </View>
            </TouchableOpacity>

          </ScrollView>

          {/* Chat UI Bottom Sheet Overlay */}
          <EchoStudioBottomSheet visible={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </SafeAreaView>
      </BackgroundGradient>
    </View>
  );
}
