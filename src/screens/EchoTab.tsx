import React, { useState, useRef, useCallback } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useProfile } from '../context/ProfileContext';

import EchoStudioBottomSheet from './EchoStudioBottomSheet';
import BackgroundGradient from '../components/BackgroundGradient';
import { WebView } from 'react-native-webview';

const orbHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }
    html, body {
      width: 100%;
      height: 100%;
      background: transparent;
      -webkit-background-clip: content-box;
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
      width: 200px;
      height: 200px;
      border-radius: 50%;
      -webkit-mask-image: -webkit-radial-gradient(circle, white 100%, black 100%);
      mask-image: radial-gradient(circle, white 100%, black 100%);
      box-shadow:
        0 0 50px 5px rgba(0, 0, 0, 0.5),
        inset 0 0 40px rgba(255, 255, 255, 0.5),
        inset 0 -20px 50px rgba(0, 0, 0, 0.2);
      animation: float 6s ease-in-out infinite;
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
      will-change: transform;
    }
    .lava {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      filter: blur(25px);
      -webkit-filter: blur(25px);
      mix-blend-mode: screen;
      animation: colorShift 20s infinite linear;
    }
    .lava::before {
      content: '';
      position: absolute;
      width: 120%;
      height: 120%;
      top: -10%;
      left: -10%;
      background:
        radial-gradient(circle at 30% 30%, #0066ff 0%, transparent 45%),
        radial-gradient(circle at 70% 30%, #ff00cc 0%, transparent 45%),
        radial-gradient(circle at 50% 60%, #00ff99 0%, transparent 45%),
        radial-gradient(circle at 80% 40%, #ff3300 0%, transparent 45%);
      filter: blur(8px);
      -webkit-filter: blur(8px);
      mix-blend-mode: screen;
    }
    .lava::after {
      content: '';
      position: absolute;
      width: 120%;
      height: 120%;
      top: -10%;
      left: -10%;
      background:
        radial-gradient(circle at 40% 40%, #0066ff 0%, transparent 35%),
        radial-gradient(circle at 60% 40%, #ff00cc 0%, transparent 35%),
        radial-gradient(circle at 50% 70%, #00ff99 0%, transparent 35%),
        radial-gradient(circle at 70% 50%, #ff3300 0%, transparent 35%);
      filter: blur(12px);
      -webkit-filter: blur(12px);
      mix-blend-mode: screen;
      animation: pulse 4s ease-in-out infinite alternate;
    }
    .eyes {
      position: absolute;
      top: 45%;
      left: 47%;
      transform: translate(-50%, -50%);
      width: 10px;
      height: 30px;
      background: rgba(255, 255, 255, 1);
      border-radius: 3px;
      box-shadow: 30px 0 0 rgba(255, 255, 255, 1);
      z-index: 60;
      animation:
        blink 4s infinite,
        lookAround 10s infinite ease-in-out;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0) translateZ(0); }
      50%       { transform: translateY(-10px) translateZ(0); }
    }
    @keyframes blink {
      0%, 96% { height: 30px; }
      98%      { height: 3px; }
      100%     { height: 30px; }
    }
    @keyframes lookAround {
      0%, 40%   { left: 47%; box-shadow: 30px 0 0 rgba(255,255,255,1); }
      45%, 55%  { left: 40%; box-shadow: 30px 0 0 rgba(255,255,255,1); }
      60%, 70%  { left: 54%; box-shadow: 30px 0 0 rgba(255,255,255,1); }
      75%, 100% { left: 47%; box-shadow: 30px 0 0 rgba(255,255,255,1); }
    }
    @keyframes colorShift {
      0%   { filter: blur(25px) hue-rotate(0deg);   -webkit-filter: blur(25px) hue-rotate(0deg); }
      100% { filter: blur(25px) hue-rotate(360deg); -webkit-filter: blur(25px) hue-rotate(360deg); }
    }
    @keyframes pulse {
      0%   { transform: scale(1);    opacity: 0.9; }
      100% { transform: scale(1.15); opacity: 1; }
    }
  </style>
</head>
<body>
  <div class="orb-wrap">
    <div class="sphere">
      <div class="lava"></div>
      <div class="eyes"></div>
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
  const { profile, isLoading } = useProfile();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState<string | undefined>();
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
                  <Text className="text-[#00FFFF] text-3xl font-light tracking-wide text-center">Hello {profile?.name.split(' ')[0] || 'User'},</Text>
                )}

                {step === 1 && (
                  <View className="items-center w-full">
                    <Text className="text-[#A0B0BA] text-sm tracking-[0.2em] uppercase mb-2 font-semibold text-center">You're currently biologically</Text>
                    <Text className="text-white text-[90px] font-thin tracking-tighter leading-none shadow-[0_0_20px_rgba(255,255,255,0.3)]">{profile?.age || '--'}</Text>
                  </View>
                )}

                {step === 2 && (
                  <View className="items-center w-full">
                    <Text className="text-[#A0B0BA] text-sm tracking-[0.3em] uppercase mb-2 font-semibold text-center">Your Echo60 Age</Text>
                    <Text className="text-[#00FFFF] text-[110px] font-thin tracking-tighter leading-none shadow-[0_0_20px_rgba(0,255,255,0.3)]">{profile?.bioAge || '--'}</Text>
                    
                    {/* Trajectory Text */}
                    <View className="flex-row items-center mt-6">
                      <Text className="text-[#00FFFF] text-xl mr-2 font-bold">↗</Text>
                      <Text className="text-[#A0B0BA] text-sm font-light tracking-wide">
                        Trajectory: <Text className="text-[#00FFFF] font-medium">Improving</Text>
                      </Text>
                    </View>
                  </View>
                )}

              </View>
            </View>

            {/* The Animated Lava Orb */}
            <View className="relative w-80 h-80 items-center justify-center my-4">
              {/* Floating Health Metrics */}
              <TouchableOpacity
                onPress={() => {
                  setChatInitialMessage("Why do I have a +15% chance of cancer based on my current data? Please explain the key risk factors.");
                  setIsChatOpen(true);
                }}
                activeOpacity={0.75}
                className="absolute top-12 -left-8 bg-black/40 px-3 py-2 rounded-2xl border border-red-500/30 z-10 shadow-lg"
              >
                <Text className="text-red-400 text-xs font-medium">+15% chance of cancer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setChatInitialMessage("Why does my data show a -10% chance of liver failure? What am I doing well that reduces this risk?");
                  setIsChatOpen(true);
                }}
                activeOpacity={0.75}
                className="absolute bottom-16 -right-10 bg-black/40 px-3 py-2 rounded-2xl border border-green-500/30 z-10 shadow-lg"
              >
                <Text className="text-green-400 text-xs font-medium">-10% chance of liver failure</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setChatInitialMessage("How am I gaining +2 years of healthspan according to my current metrics? What should I keep doing?");
                  setIsChatOpen(true);
                }}
                activeOpacity={0.75}
                className="absolute top-1/3 -right-8 bg-black/40 px-3 py-2 rounded-2xl border border-green-500/30 z-10 shadow-lg"
              >
                <Text className="text-green-400 text-xs font-medium">+2 yrs healthspan</Text>
              </TouchableOpacity>
              
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
          <EchoStudioBottomSheet
            visible={isChatOpen}
            onClose={() => {
              setIsChatOpen(false);
              setChatInitialMessage(undefined);
            }}
            initialMessage={chatInitialMessage}
          />
        </SafeAreaView>
      </BackgroundGradient>
    </View>
  );
}
