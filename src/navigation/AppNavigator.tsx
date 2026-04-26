import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EchoTab from '../screens/EchoTab';
import MetricsTab from '../screens/MetricsTab';
import MetricDetailScreen from '../screens/MetricDetailScreen';
import ProfileTab from '../screens/ProfileTab';
import { Text, View, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { MetricKey } from '../data/mockData';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LiquidGlassView, isLiquidGlassSupported } from '@callstack/liquid-glass';

export type RootTabParamList = {
  Echo: undefined;
  MetricsStack: undefined;
  Profile: undefined;
};

export type MetricsStackParamList = {
  MetricsHome: undefined;
  MetricDetail: { metric: MetricKey };
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const MetricsStack = createNativeStackNavigator<MetricsStackParamList>();

function MetricsNavigator() {
  return (
    <MetricsStack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <MetricsStack.Screen name="MetricsHome" component={MetricsTab} />
      <MetricsStack.Screen name="MetricDetail" component={MetricDetailScreen} />
    </MetricsStack.Navigator>
  );
}

const TAB_CONFIG = [
  { name: 'Echo',         icon: '✦', label: 'Today' },
  { name: 'MetricsStack', icon: '⚲', label: 'Metrics' },
  { name: 'Profile',      icon: '⚙', label: 'Profile' },
] as const;

function LiquidGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const glassSupported = isLiquidGlassSupported;

  const TabContent = () => (
    <View style={[styles.tabRow]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const tab = TAB_CONFIG.find(t => t.name === route.name) ?? TAB_CONFIG[0];

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name as any);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabIcon, { color: isFocused ? '#FFFFFF' : '#6B7B8D' }]}>
              {tab.icon}
            </Text>
            <Text style={[styles.tabLabel, { color: isFocused ? '#FFFFFF' : '#6B7B8D', fontWeight: isFocused ? '600' : '400' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <View style={[styles.barContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }]}>
      {glassSupported ? (
        <LiquidGlassView
          style={styles.glassBar}
          effect="regular"
          interactive={false}
        >
          <TabContent />
        </LiquidGlassView>
      ) : (
        // Fallback for non-iOS 26 devices
        <View style={[styles.glassBar, styles.fallbackBar]}>
          <TabContent />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  barContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  glassBar: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  fallbackBar: {
    backgroundColor: 'rgba(20, 22, 28, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 3,
  },
  tabIcon: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
});

export const AppNavigator = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#050d12' }}>
      <Tab.Navigator
        initialRouteName="Echo"
        tabBar={(props) => <LiquidGlassTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Echo" component={EchoTab} />
        <Tab.Screen name="MetricsStack" component={MetricsNavigator} />
        <Tab.Screen name="Profile" component={ProfileTab} />
      </Tab.Navigator>
    </View>
  );
};
