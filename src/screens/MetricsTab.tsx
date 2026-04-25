import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import BackgroundGradient from '../components/BackgroundGradient';
import { useProfile } from '../context/ProfileContext';
import { METRIC_META, MetricKey } from '../data/mockData';

const METRICS: MetricKey[] = ['sleep', 'heartRate', 'activity', 'calories', 'hrv', 'hydration'];

export default function MetricsTab({ navigation }: { navigation: any }) {
  const { profile } = useProfile();
  const latest = profile.data[profile.data.length - 1];
  const prev   = profile.data[profile.data.length - 8]; // 7 days ago

  const delta = (key: MetricKey) => {
    if (!prev) return null;
    const d = ((latest[key] as number) - (prev[key] as number)) / (prev[key] as number) * 100;
    return d.toFixed(1);
  };

  return (
    <View style={{ flex: 1 }}>
      <BackgroundGradient>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>

            {/* Header */}
            <Text style={{ fontSize: 11, color: '#A0B0BA', fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4, marginTop: 16 }}>
              {profile.emoji} {profile.name}
            </Text>
            <Text style={{ fontSize: 26, color: '#FFFFFF', fontWeight: '200', marginBottom: 24, letterSpacing: -0.5 }}>
              Today's Metrics
            </Text>

            {/* AI Summary */}
            <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 28 }}>
              <Text style={{ fontSize: 11, color: '#A0B0BA', fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>Echo Insight</Text>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 22 }}>
                Your{' '}
                <Text style={{ color: '#818CF8', fontWeight: '600' }}>😴 sleep {latest.sleep}h</Text>
                {' '}and{' '}
                <Text style={{ color: '#F87171', fontWeight: '600' }}>❤️ HR {latest.heartRate}bpm</Text>
                {' '}are within target. Watch{' '}
                <Text style={{ color: '#34D399', fontWeight: '600' }}>🏃 activity {latest.activity}km</Text>
                {' '}— tap any card to see your full trend.
              </Text>
            </View>

            {/* Section label */}
            <Text style={{ fontSize: 11, color: '#A0B0BA', fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>
              All Metrics
            </Text>

            {/* 2-column grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {METRICS.map((key) => {
                const meta = METRIC_META[key];
                const val  = latest[key] as number;
                const d    = delta(key);
                const isGood = d !== null
                  ? (meta.goodDirection === 'up' ? parseFloat(d) >= 0 : parseFloat(d) <= 0)
                  : true;
                const deltaColor = isGood ? '#22C55E' : '#EF4444';
                const arrow = d !== null ? (parseFloat(d) >= 0 ? '↑' : '↓') : '';

                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => navigation.navigate('MetricDetail', { metric: key })}
                    style={{
                      width: '47.5%',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: 24,
                      padding: 20,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.09)',
                    }}
                    activeOpacity={0.75}
                  >
                    {/* Icon + label row */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
                      <Text style={{ fontSize: 18, marginRight: 8 }}>{meta.emoji}</Text>
                      <Text style={{ fontSize: 11, color: '#A0B0BA', fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase' }}>
                        {meta.label}
                      </Text>
                    </View>

                    {/* Value */}
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 }}>
                      <Text style={{ fontSize: 40, color: meta.color, fontWeight: '100', letterSpacing: -1 }}>
                        {val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#A0B0BA', marginLeft: 4, fontWeight: '500' }}>{meta.unit}</Text>
                    </View>

                    {/* Delta */}
                    <Text style={{ fontSize: 12, color: deltaColor, fontWeight: '600' }}>
                      {arrow} {d !== null ? `${Math.abs(parseFloat(d))}%` : '—'}
                    </Text>

                    {/* Tap hint */}
                    <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 8 }}>Tap for trends →</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

          </ScrollView>
        </SafeAreaView>
      </BackgroundGradient>
    </View>
  );
}
