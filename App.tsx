import "./global.css";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { StatusBar } from "expo-status-bar";
import { ProfileProvider } from "./src/context/ProfileContext";

export default function App() {
  return (
    <ProfileProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </ProfileProvider>
  );
}
