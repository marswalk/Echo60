import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile, DailyEntry } from '../types';

const PROFILES_KEY = '@echo60_profiles';
const ACTIVE_PROFILE_ID_KEY = '@echo60_active_profile_id';
const ONBOARDING_COMPLETED_KEY = '@echo60_onboarding_completed';

export class StorageService {
  static async getProfiles(): Promise<Profile[]> {
    try {
      const data = await AsyncStorage.getItem(PROFILES_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (e) {
      console.error('Failed to get profiles from storage', e);
      return [];
    }
  }

  static async saveProfiles(profiles: Profile[]): Promise<void> {
    try {
      await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    } catch (e) {
      console.error('Failed to save profiles to storage', e);
    }
  }

  static async getActiveProfileId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ACTIVE_PROFILE_ID_KEY);
    } catch (e) {
      return null;
    }
  }

  static async setActiveProfileId(id: string): Promise<void> {
    try {
      await AsyncStorage.setItem(ACTIVE_PROFILE_ID_KEY, id);
    } catch (e) {
      console.error('Failed to set active profile ID', e);
    }
  }

  static async getHasCompletedOnboarding(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      return value === 'true';
    } catch (e) {
      return false;
    }
  }

  static async setHasCompletedOnboarding(completed: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, completed ? 'true' : 'false');
    } catch (e) {
      console.error('Failed to set onboarding state', e);
    }
  }

  static async updateProfileData(profileId: string, entry: DailyEntry, newEcho60Age?: number): Promise<Profile | null> {
    const profiles = await this.getProfiles();
    const index = profiles.findIndex(p => p.id === profileId);
    if (index === -1) return null;

    const profile = profiles[index];
    
    // Check if entry for this date already exists
    const entryIndex = profile.data.findIndex(d => d.date === entry.date);
    if (entryIndex !== -1) {
      profile.data[entryIndex] = { ...profile.data[entryIndex], ...entry };
    } else {
      profile.data.push(entry);
      // Sort data by date just in case LLM writes retroactively
      profile.data.sort((a, b) => a.date.localeCompare(b.date));
      // Keep only last 90 days
      if (profile.data.length > 90) {
        profile.data.shift();
      }
    }

    // Only update BioAge if LLM explicitly provided a new one
    if (newEcho60Age !== undefined) {
      const previousBioAge = profile.bioAge;
      
      // Determine trend direction based on movement from previous value
      if (newEcho60Age < previousBioAge) {
        profile.bioAgeTrend = 'improving'; // Age went down — biologically younger
      } else if (newEcho60Age > previousBioAge) {
        profile.bioAgeTrend = 'declining'; // Age went up — biologically older
      } else {
        profile.bioAgeTrend = 'neutral';
      }

      profile.bioAge = newEcho60Age;
      
      // Update historical Echo60 trend
      const lastHistorical = profile.historicalEcho60[profile.historicalEcho60.length - 1];
      if (!lastHistorical || lastHistorical.date !== entry.date) {
        profile.historicalEcho60.push({ date: entry.date, age: newEcho60Age });
      } else {
        lastHistorical.age = newEcho60Age; // Update today's if it already exists
      }
    }

    profiles[index] = profile;
    await this.saveProfiles(profiles);
    return profile;
  }
}
