import "./global.css";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { StatusBar } from "expo-status-bar";
import { ProfileProvider, useProfile } from "./src/context/ProfileContext";
import OnboardingScreen from "./src/screens/OnboardingScreen";

function MainApp() {
  const { hasCompletedOnboarding, isLoading } = useProfile();

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {hasCompletedOnboarding ? <AppNavigator /> : <OnboardingScreen />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ProfileProvider>
      <MainApp />
    </ProfileProvider>
  );
}
