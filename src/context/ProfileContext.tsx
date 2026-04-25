import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, DailyEntry } from '../types';
import { StorageService } from '../services/StorageService';
import { MOCK_PROFILES } from '../data/mockData';

interface ProfileContextType {
  profile: Profile | null;
  profiles: Profile[];
  setProfileById: (id: string) => Promise<void>;
  addDailyLog: (entry: DailyEntry) => Promise<void>;
  isLoading: boolean;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  profiles: [],
  setProfileById: async () => {},
  addDailyLog: async () => {},
  isLoading: true,
});

// Helper to convert MockProfile to Profile format
function migrateMockProfiles(): Profile[] {
  return MOCK_PROFILES.map(p => ({
    ...p,
    historicalEcho60: [
      {
        date: p.data[p.data.length - 1]?.date || new Date().toISOString().split('T')[0],
        age: p.bioAge,
      }
    ]
  }));
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        let storedProfiles = await StorageService.getProfiles();
        
        // If empty, initialize with migrated mocks for demonstration
        if (storedProfiles.length === 0) {
          storedProfiles = migrateMockProfiles();
          await StorageService.saveProfiles(storedProfiles);
        }
        
        setProfiles(storedProfiles);

        let activeId = await StorageService.getActiveProfileId();
        let activeProfile = storedProfiles.find(p => p.id === activeId);
        
        if (!activeProfile && storedProfiles.length > 0) {
          activeProfile = storedProfiles[0];
          await StorageService.setActiveProfileId(activeProfile.id);
        }

        setProfile(activeProfile || null);
      } catch (e) {
        console.error("Error initializing profiles", e);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const setProfileById = async (id: string) => {
    const found = profiles.find(p => p.id === id);
    if (found) {
      setProfile(found);
      await StorageService.setActiveProfileId(id);
    }
  };

  const addDailyLog = async (entry: DailyEntry) => {
    if (!profile) return;
    
    const updatedProfile = await StorageService.updateProfileData(profile.id, entry);
    if (updatedProfile) {
      setProfile(updatedProfile);
      // Update in the profiles list too
      setProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, profiles, setProfileById, addDailyLog, isLoading }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
