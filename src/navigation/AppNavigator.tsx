import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import EchoTab from '../screens/EchoTab';
import MetricsTab from '../screens/MetricsTab';
import FutureLabTab from '../screens/FutureLabTab';
import ProfileTab from '../screens/ProfileTab';
import { Text } from 'react-native';

export type RootTabParamList = {
  Echo: undefined;
  Metrics: undefined;
  FutureLab: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export const AppNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Echo"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopWidth: 1,
          borderTopColor: '#1C1C1E',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarActiveTintColor: '#00FFFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarIcon: ({ color }) => {
          let iconName = '';
          if (route.name === 'Echo') iconName = '✦';
          else if (route.name === 'Metrics') iconName = '📊';
          else if (route.name === 'FutureLab') iconName = '⚗️';
          else if (route.name === 'Profile') iconName = '⚙️';
          
          return <Text style={{ color, fontSize: 20 }}>{iconName}</Text>;
        },
      })}
    >
      <Tab.Screen name="Echo" component={EchoTab} options={{ title: 'Echo' }} />
      <Tab.Screen name="Metrics" component={MetricsTab} options={{ title: 'Metrics' }} />
      <Tab.Screen name="FutureLab" component={FutureLabTab} options={{ title: 'Future Lab' }} />
      <Tab.Screen name="Profile" component={ProfileTab} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};
