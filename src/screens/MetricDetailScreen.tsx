import React, { useState, useCallback } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity, useWindowDimensions,
} from 'react-native';
import BackgroundGradient from '../components/BackgroundGradient';
import LineChart from '../components/LineChart';
import { useProfile } from '../context/ProfileContext';
import { MetricKey, METRIC_META, DailyEntry } from '../data/mockData';

type Range = 'week' | 'month' | 'year';

interface Props {
  route: { params: { metric: MetricKey } };
  navigation: any;
}

function getLabels(range: Range, data: DailyEntry[]): string[] {
  if (range === 'week') {
    return data.slice(-7).map(d => {
      const date = new Date(d.date);
      return ['Su','Mo','Tu','We','Th','Fr','Sa'][date.getDay()];
    });
  }
  if (range === 'month') {
    return data.slice(-30).map(d => {
      const day = new Date(d.date).getDate();
      return day % 5 === 1 ? String(day) : '';
    });
  }
  // year → 12 monthly labels
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
}

function getValues(range: Range, data: DailyEntry[], key: MetricKey): number[] {
  if (range === 'week')  return data.slice(-7).map(d => d[key] as number);
  if (range === 'month') return data.slice(-30).map(d => d[key] as number);

  // year → average per calendar month (use all 90 days grouped by month index)
  const byMonth: Record<number, number[]> = {};
  data.forEach(d => {
    const m = new Date(d.date).getMonth();
    if (!byMonth[m]) byMonth[m] = [];
    byMonth[m].push(d[key] as number);
  });
  return Array.from({ length: 12 }, (_, m) => {
    const vals = byMonth[m] || [];
    return vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0;
  });
}

export default function MetricDetailScreen({ route, navigation }: Props) {
  const { metric } = route.params;
  const { profile } = useProfile();
  
  if (!profile) return <View style={{ flex: 1, backgroundColor: '#0A0A0A' }} />;

  const meta = METRIC_META[metric];
  const { width } = useWindowDimensions();
  const [range, setRange] = useState<Range>('week');

  const values = getValues(range, profile.data, metric);
  const labels = getLabels(range, profile.data);

  const avg = values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0;
  const minVal = values.length ? Math.min(...values) : 0;
  const maxVal = values.length ? Math.max(...values) : 0;
  const latest = values[values.length - 1] ?? 0;

  // Week-over-week delta
  const prev = getValues(range, profile.data.slice(0, -7), metric);
  const prevAvg = prev.length ? prev.reduce((a, b) => a + b, 0) / prev.length : avg;
  const deltaPercent = prevAvg ? ((avg - prevAvg) / prevAvg * 100).toFixed(1) : '0';
  const isGoodDelta = meta.goodDirection === 'up' ? parseFloat(deltaPercent) >= 0 : parseFloat(deltaPercent) <= 0;

  const chartWidth = width - 40;

  return (
    <View style={{ flex: 1 }}>
      <BackgroundGradient>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 }}>
              <Text style={{ color: meta.color, fontSize: 22 }}>←</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 13, color: '#A0B0BA', fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase' }}>
              {meta.emoji}  {meta.label}
            </Text>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}>
            {/* Hero number */}
            <View style={{ alignItems: 'center', marginVertical: 24 }}>
              <Text style={{ fontSize: 80, fontWeight: '100', color: meta.color, letterSpacing: -2, lineHeight: 88 }}>
                {latest % 1 === 0 ? latest.toFixed(0) : latest.toFixed(1)}
              </Text>
              <Text style={{ fontSize: 14, color: '#A0B0BA', fontWeight: '500', letterSpacing: 1 }}>{meta.unit}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 }}>
                <Text style={{ fontSize: 13, color: isGoodDelta ? '#22C55E' : '#EF4444', fontWeight: '600' }}>
                  {parseFloat(deltaPercent) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(deltaPercent))}%
                </Text>
                <Text style={{ fontSize: 12, color: '#A0B0BA' }}>vs previous period</Text>
              </View>
            </View>

            {/* Range toggle */}
            <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 100, padding: 4, marginBottom: 24 }}>
              {(['week', 'month', 'year'] as Range[]).map(r => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRange(r)}
                  style={{
                    flex: 1, paddingVertical: 8, borderRadius: 100, alignItems: 'center',
                    backgroundColor: range === r ? meta.color : 'transparent',
                  }}
                >
                  <Text style={{
                    fontSize: 13, fontWeight: '600', textTransform: 'capitalize',
                    color: range === r ? '#000' : '#A0B0BA',
                  }}>
                    {r === 'week' ? '7D' : r === 'month' ? '30D' : '1Y'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Chart */}
            <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 16, marginBottom: 24 }}>
              <LineChart
                data={values}
                labels={labels}
                color={meta.color}
                width={chartWidth - 32}
                height={200}
                unit={meta.unit}
              />
            </View>

            {/* Stats summary */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Average', value: avg },
                { label: 'Min', value: minVal },
                { label: 'Max', value: maxVal },
              ].map(s => (
                <View key={s.label} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center' }}>
                  <Text style={{ fontSize: 11, color: '#A0B0BA', fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>{s.label}</Text>
                  <Text style={{ fontSize: 22, color: '#FFFFFF', fontWeight: '200' }}>
                    {s.value % 1 === 0 ? s.value.toFixed(0) : s.value.toFixed(1)}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#A0B0BA' }}>{meta.unit}</Text>
                </View>
              ))}
            </View>

            {/* Profile context */}
            <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
              <Text style={{ fontSize: 11, color: '#A0B0BA', fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
                {profile.emoji} {profile.name} · Insight
              </Text>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 22 }}>
                {getInsight(metric, avg, meta.goodDirection)}
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </BackgroundGradient>
    </View>
  );
}

function getInsight(metric: MetricKey, avg: number, direction: 'up' | 'down'): string {
  const insights: Record<MetricKey, (avg: number) => string> = {
    sleep: (v) => v >= 8 ? `Excellent! ${v}h average is in the optimal range for cellular repair and memory consolidation.` : v >= 7 ? `Good, but pushing to 8h could improve HRV by up to 12% and reduce your bio-age by ~1.5 years.` : `Chronic sleep restriction detected. This is the #1 modifiable factor affecting your bio-age. Prioritize sleep above all else.`,
    heartRate: (v) => v <= 60 ? `Elite cardiovascular fitness. Resting HR below 60 correlates with 25% lower cardiovascular risk.` : v <= 72 ? `Healthy range. Consistent zone-2 cardio could bring this below 65 within 8 weeks.` : `Elevated resting HR suggests chronic stress or deconditioning. Aim for 150 mins moderate cardio weekly.`,
    activity: (v) => v >= 8 ? `High activity level — you're in the top 10% of your age group. Excellent longevity marker.` : v >= 4 ? `Meeting WHO guidelines. Adding 2km daily could reduce all-cause mortality risk by 15%.` : `Below optimal activity levels. Even a 20-minute daily walk makes a measurable difference.`,
    calories: (v) => `Averaging ${v} kcal/day. Ensure this aligns with your training load. Under-fueling suppresses HRV and immune function.`,
    hrv: (v) => v >= 70 ? `Exceptional recovery capacity. High HRV indicates strong parasympathetic nervous system dominance.` : v >= 45 ? `Good HRV range. Consistent sleep schedule and cold exposure can push this higher.` : `Low HRV signals your nervous system is under load. Prioritize recovery: sleep, de-stress, reduce alcohol.`,
    hydration: (v) => v >= 2.5 ? `Well hydrated! Consistent hydration supports optimal cellular function and cognitive clarity.` : v >= 1.8 ? `Adequate, but aiming for 2.5L daily improves energy and HRV measurably.` : `Under-hydrated on average. Even mild dehydration (2%) impairs cognition and elevates cortisol.`,
  };
  return insights[metric](avg);
}
