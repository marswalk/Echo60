import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AppState, HealthData, Screen, SimulationResult } from '../types';

interface AppContextType extends AppState {
  updateHealthData: (data: Partial<HealthData>) => void;
  setSimulation: (result: SimulationResult) => void;
  navigateTo: (screen: Screen) => void;
  setUserEmail: (email: string) => void;
  setLetterSent: (sent: boolean) => void;
}

const defaultState: AppState = {
  healthData: {},
  simulation: null,
  currentScreen: 'welcome',
  userEmail: '',
  letterSent: false,
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);

  const updateHealthData = useCallback((data: Partial<HealthData>) => {
    setState((prev) => ({ ...prev, healthData: { ...prev.healthData, ...data } }));
  }, []);

  const setSimulation = useCallback((result: SimulationResult) => {
    setState((prev) => ({ ...prev, simulation: result }));
  }, []);

  const navigateTo = useCallback((screen: Screen) => {
    setState((prev) => ({ ...prev, currentScreen: screen }));
  }, []);

  const setUserEmail = useCallback((email: string) => {
    setState((prev) => ({ ...prev, userEmail: email }));
  }, []);

  const setLetterSent = useCallback((sent: boolean) => {
    setState((prev) => ({ ...prev, letterSent: sent }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        updateHealthData,
        setSimulation,
        navigateTo,
        setUserEmail,
        setLetterSent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
