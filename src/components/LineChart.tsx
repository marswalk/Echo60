import React from 'react';
import { View } from 'react-native';
import Svg, { Polyline, Line, Text as SvgText, Circle, Defs, LinearGradient, Stop, Path } from 'react-native-svg';

interface LineChartProps {
  data: number[];
  labels?: string[];
  color: string;
  width: number;
  height: number;
  unit: string;
}

const PAD = { top: 16, right: 16, bottom: 36, left: 48 };

export default function LineChart({ data, labels, color, width, height, unit }: LineChartProps) {
  if (!data || data.length < 2) return null;

  const chartW = width - PAD.left - PAD.right;
  const chartH = height - PAD.top - PAD.bottom;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Map data point → SVG coords
  const px = (i: number) => PAD.left + (i / (data.length - 1)) * chartW;
  const py = (v: number) => PAD.top + chartH - ((v - min) / range) * chartH;

  const polylinePoints = data.map((v, i) => `${px(i)},${py(v)}`).join(' ');

  // Build filled area path
  const areaPath = [
    `M ${px(0)} ${py(data[0])}`,
    ...data.slice(1).map((v, i) => `L ${px(i + 1)} ${py(v)}`),
    `L ${px(data.length - 1)} ${PAD.top + chartH}`,
    `L ${px(0)} ${PAD.top + chartH}`,
    'Z',
  ].join(' ');

  // Y axis labels (3 ticks)
  const ticks = [min, min + range * 0.5, max];

  // X axis labels: show first, middle, last
  const xLabels = labels && labels.length >= 2
    ? [0, Math.floor((data.length - 1) / 2), data.length - 1]
    : [];

  const gradId = `grad_${color.replace('#', '')}`;

  return (
    <View>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.35" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Horizontal grid lines */}
        {ticks.map((t, i) => (
          <Line
            key={i}
            x1={PAD.left}
            y1={py(t)}
            x2={PAD.left + chartW}
            y2={py(t)}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
        ))}

        {/* Filled area */}
        <Path d={areaPath} fill={`url(#${gradId})`} />

        {/* Main line */}
        <Polyline
          points={polylinePoints}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data dot at last point */}
        <Circle
          cx={px(data.length - 1)}
          cy={py(data[data.length - 1])}
          r={4}
          fill={color}
          stroke="rgba(0,0,0,0.5)"
          strokeWidth={2}
        />

        {/* Y axis labels */}
        {ticks.map((t, i) => (
          <SvgText
            key={i}
            x={PAD.left - 6}
            y={py(t) + 4}
            textAnchor="end"
            fontSize={10}
            fill="rgba(255,255,255,0.35)"
          >
            {t % 1 === 0 ? t.toFixed(0) : t.toFixed(1)}
          </SvgText>
        ))}

        {/* X axis labels */}
        {xLabels.map((idx) =>
          labels ? (
            <SvgText
              key={idx}
              x={px(idx)}
              y={height - 6}
              textAnchor="middle"
              fontSize={10}
              fill="rgba(255,255,255,0.35)"
            >
              {labels[idx]}
            </SvgText>
          ) : null
        )}
      </Svg>
    </View>
  );
}
