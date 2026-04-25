import React, { createContext, useContext, useState } from 'react';
import { MOCK_PROFILES, MockProfile } from '../data/mockData';

interface ProfileContextType {
  profile: MockProfile;
  setProfileById: (id: string) => void;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: MOCK_PROFILES[0],
  setProfileById: () => {},
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<MockProfile>(MOCK_PROFILES[0]);

  const setProfileById = (id: string) => {
    const found = MOCK_PROFILES.find(p => p.id === id);
    if (found) setProfile(found);
  };

  return (
    <ProfileContext.Provider value={{ profile, setProfileById }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
