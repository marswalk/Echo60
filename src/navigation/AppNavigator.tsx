import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EchoTab from '../screens/EchoTab';
import MetricsTab from '../screens/MetricsTab';
import MetricDetailScreen from '../screens/MetricDetailScreen';
import FutureLabTab from '../screens/FutureLabTab';
import ProfileTab from '../screens/ProfileTab';
import { Text, View } from 'react-native';
import { MetricKey } from '../data/mockData';

export type RootTabParamList = {
  Echo: undefined;
  MetricsStack: undefined;
  FutureLab: undefined;
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

export const AppNavigator = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#050d12' }}>
      <Tab.Navigator
        initialRouteName="Echo"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 25,
            left: 20,
            right: 20,
            elevation: 0,
            backgroundColor: 'rgba(20, 20, 25, 0.9)',
            borderRadius: 30,
            height: 70,
            borderTopWidth: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.5,
            shadowRadius: 15,
            paddingBottom: 0,
          },
          tabBarItemStyle: { padding: 5 },
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#A0B0BA',
          tabBarShowLabel: false,
          tabBarIcon: ({ focused, color }) => {
            let iconName = '';
            let label = '';
            if (route.name === 'Echo') { iconName = '✦'; label = 'Today'; }
            else if (route.name === 'MetricsStack') { iconName = '⚲'; label = 'Metrics'; }
            else if (route.name === 'FutureLab') { iconName = '⚗️'; label = 'Future'; }
            else if (route.name === 'Profile') { iconName = '⚙'; label = 'Profile'; }

            return (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color, fontSize: 24, marginBottom: 2 }}>{iconName}</Text>
                <Text style={{ color, fontSize: 10, fontWeight: focused ? '600' : '400', letterSpacing: 0.5 }}>{label}</Text>
              </View>
            );
          },
        })}
      >
        <Tab.Screen name="Echo" component={EchoTab} />
        <Tab.Screen name="MetricsStack" component={MetricsNavigator} />
        <Tab.Screen name="FutureLab" component={FutureLabTab} />
        <Tab.Screen name="Profile" component={ProfileTab} />
      </Tab.Navigator>
    </View>
  );
};
