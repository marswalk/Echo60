import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import BackgroundGradient from '../components/BackgroundGradient';
import { useProfile } from '../context/ProfileContext';
import { MOCK_PROFILES } from '../data/mockData';

export default function ProfileTab() {
  const { profile, setProfileById } = useProfile();

  return (
    <View style={{ flex: 1 }}>
      <BackgroundGradient>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>

            {/* Header */}
            <Text style={{ fontSize: 11, color: '#A0B0BA', fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4, marginTop: 16 }}>
              Settings
            </Text>
            <Text style={{ fontSize: 26, color: '#FFFFFF', fontWeight: '200', marginBottom: 28, letterSpacing: -0.5 }}>
              Profile
            </Text>

            {/* Profile Switcher */}
            <Text style={{ fontSize: 11, color: '#A0B0BA', fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
              Switch Profile
            </Text>

            <View style={{ gap: 12, marginBottom: 32 }}>
              {MOCK_PROFILES.map((p) => {
                const isActive = p.id === profile.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setProfileById(p.id)}
                    activeOpacity={0.75}
                    style={{
                      backgroundColor: isActive ? 'rgba(0, 255, 255, 0.08)' : 'rgba(255,255,255,0.04)',
                      borderRadius: 20,
                      padding: 18,
                      borderWidth: 1,
                      borderColor: isActive ? 'rgba(0,255,255,0.4)' : 'rgba(255,255,255,0.08)',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 32, marginRight: 16 }}>{p.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, color: '#FFFFFF', fontWeight: '500', marginBottom: 2 }}>{p.name}</Text>
                      <Text style={{ fontSize: 12, color: '#A0B0BA' }}>{p.tagline}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 11, color: '#A0B0BA', marginBottom: 2 }}>Bio Age</Text>
                      <Text style={{ fontSize: 20, color: '#00FFFF', fontWeight: '200' }}>{p.bioAge}</Text>
                    </View>
                    {isActive && (
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#00FFFF', marginLeft: 12 }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Settings */}
            <Text style={{ fontSize: 11, color: '#A0B0BA', fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
              Connections
            </Text>

            <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 28 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                <Text style={{ fontSize: 16, color: '#FFFFFF', fontWeight: '300' }}>Apple Health Sync</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#22C55E', marginRight: 6 }} />
                  <Text style={{ fontSize: 13, color: '#22C55E' }}>Connected</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                <Text style={{ fontSize: 16, color: '#FFFFFF', fontWeight: '300' }}>Local LLM Server</Text>
                <TextInput
                  style={{ fontSize: 14, color: '#A0B0BA', textAlign: 'right' }}
                  placeholder="192.168.1.X"
                  placeholderTextColor="#555"
                  defaultValue="192.168.1.100"
                />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 }}>
                <Text style={{ fontSize: 16, color: '#FFFFFF', fontWeight: '300' }}>Wearable Source</Text>
                <Text style={{ fontSize: 14, color: '#A0B0BA' }}>Oura Ring</Text>
              </View>
            </View>

            <TouchableOpacity style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 100, padding: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', alignItems: 'center' }}>
              <Text style={{ fontSize: 15, color: '#EF4444', fontWeight: '300' }}>Reset Twin Data</Text>
            </TouchableOpacity>

          </ScrollView>
        </SafeAreaView>
      </BackgroundGradient>
    </View>
  );
}
