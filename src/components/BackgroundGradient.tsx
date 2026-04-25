import React, { useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  children: React.ReactNode;
};

// Inject a CSS keyframe animation once on Web
function injectWebAnimation() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('bg-anim-style')) return;
  const style = document.createElement('style');
  style.id = 'bg-anim-style';
  style.innerHTML = `
    @keyframes bgShift {
      0%   { background-position: 0% 50%; }
      50%  { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .animated-bg {
      width: 100%;
      height: 100%;
      position: absolute;
      inset: 0;
      background: linear-gradient(
        135deg,
        #04090d,
        #081520,
        #0d1f2d,
        #071018,
        #04090d
      );
      background-size: 400% 400%;
      animation: bgShift 18s ease infinite;
    }
  `;
  document.head.appendChild(style);
}

export default function BackgroundGradient({ children }: Props) {
  useEffect(() => {
    if (Platform.OS === 'web') injectWebAnimation();
  }, []);

  if (Platform.OS === 'web') {
    return (
      <View style={StyleSheet.absoluteFillObject}>
        {React.createElement('div', { className: 'animated-bg' })}
        <View style={{ flex: 1, position: 'relative' }}>{children}</View>
      </View>
    );
  }

  // Native: static dark gradient (animation is too heavy for native here)
  return (
    <LinearGradient
      colors={['#050e14', '#0d1f2d', '#04090d']}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={StyleSheet.absoluteFillObject}
    >
      {children}
    </LinearGradient>
  );
}

