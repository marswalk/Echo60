import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import QuestionnaireScreen from '../screens/QuestionnaireScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ChatScreen from '../screens/ChatScreen';
import LetterScreen from '../screens/LetterScreen';
import { HealthProfile, Trajectory } from '../types';

export type RootStackParamList = {
  Welcome: undefined;
  Questionnaire: undefined;
  Dashboard: { profile: HealthProfile; trajectories: Trajectory[] };
  Chat: { profile: HealthProfile; trajectories: Trajectory[] };
  Letter: { profile: HealthProfile; trajectories: Trajectory[] };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerStyle: { backgroundColor: '#0F172A' },
        headerTintColor: '#F8FAFC',
        headerTitleStyle: { fontWeight: 'bold' },
        contentStyle: { backgroundColor: '#0F172A' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Questionnaire" component={QuestionnaireScreen} options={{ title: 'Your Baseline' }} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Future Trajectory', headerBackVisible: false }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Digital Twin' }} />
      <Stack.Screen name="Letter" component={LetterScreen} options={{ title: 'A Message from 2056' }} />
    </Stack.Navigator>
  );
};
