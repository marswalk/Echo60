import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile, DailyEntry } from '../types';
import { calculateEcho60Age } from '../utils/bioAge';

const PROFILES_KEY = '@echo60_profiles';
const ACTIVE_PROFILE_ID_KEY = '@echo60_active_profile_id';

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

  static async updateProfileData(profileId: string, entry: DailyEntry): Promise<Profile | null> {
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
      // Keep only last 90 days
      if (profile.data.length > 90) {
        profile.data.shift();
      }
    }

    // Recalculate BioAge based on latest data
    const newBioAge = calculateEcho60Age(profile.data);
    profile.bioAge = newBioAge;
    
    // Update historical Echo60 trend if needed
    const lastHistorical = profile.historicalEcho60[profile.historicalEcho60.length - 1];
    if (!lastHistorical || lastHistorical.date !== entry.date) {
      profile.historicalEcho60.push({ date: entry.date, age: newBioAge });
    } else {
      lastHistorical.age = newBioAge; // Update today's if it already exists
    }

    profiles[index] = profile;
    await this.saveProfiles(profiles);
    return profile;
  }
}
