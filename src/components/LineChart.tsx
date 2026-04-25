import React from 'react';
import { View, Text } from 'react-native';

interface LineChartProps {
  data: number[];
  labels?: string[];
  color: string;
  width: number;
  height: number;
  unit: string;
}

const PAD = { top: 16, right: 16, bottom: 36, left: 48 };

export default function LineChart({ data, labels, color, width, height }: LineChartProps) {
  if (!data || data.length < 2) return null;

  const chartW = width - PAD.left - PAD.right;
  const chartH = height - PAD.top - PAD.bottom;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Map data point to chart coordinates
  const px = (i: number) => PAD.left + (i / (data.length - 1)) * chartW;
  const py = (v: number) => PAD.top + chartH - ((v - min) / range) * chartH;

  // Y axis labels (3 ticks)
  const ticks = [min, min + range * 0.5, max];

  // X axis labels: show first, middle, last
  const xLabels = labels && labels.length >= 2
    ? [0, Math.floor((data.length - 1) / 2), data.length - 1]
    : [];

  const lineSegments = data.slice(1).map((v, i) => {
    const x1 = px(i);
    const y1 = py(data[i]);
    const x2 = px(i + 1);
    const y2 = py(v);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    return {
      key: `seg-${i}`,
      left: (x1 + x2) / 2 - length / 2,
      top: (y1 + y2) / 2,
      length,
      angle,
    };
  });

  return (
    <View>
      <View style={{ width, height, position: 'relative' }}>
        {/* Horizontal grid lines */}
        {ticks.map((t, i) => (
          <View
            key={`grid-${i}`}
            style={{
              position: 'absolute',
              left: PAD.left,
              top: py(t),
              width: chartW,
              height: 1,
              backgroundColor: 'rgba(255,255,255,0.08)',
            }}
          />
        ))}

        {/* Main line segments */}
        {lineSegments.map((seg) => (
          <View
            key={seg.key}
            style={{
              position: 'absolute',
              left: seg.left,
              top: seg.top,
              width: seg.length,
              height: 2.5,
              backgroundColor: color,
              borderRadius: 2,
              transform: [{ rotate: `${seg.angle}rad` }],
            }}
          />
        ))}

        {/* Data points */}
        {data.map((v, i) => (
          <View
            key={`point-${i}`}
            style={{
              position: 'absolute',
              left: px(i) - 2,
              top: py(v) - 2,
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: color,
              opacity: 0.8,
            }}
          />
        ))}

        {/* Data dot at last point */}
        <View
          style={{
            position: 'absolute',
            left: px(data.length - 1) - 4,
            top: py(data[data.length - 1]) - 4,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: color,
            borderWidth: 2,
            borderColor: 'rgba(0,0,0,0.5)',
          }}
        />

        {/* Y axis labels */}
        {ticks.map((t, i) => (
          <Text
            key={`y-${i}`}
            style={{
              position: 'absolute',
              left: 0,
              top: py(t) - 8,
              width: PAD.left - 8,
              textAlign: 'right',
              fontSize: 10,
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            {t % 1 === 0 ? t.toFixed(0) : t.toFixed(1)}
          </Text>
        ))}

        {/* X axis labels */}
        {xLabels.map((idx) =>
          labels ? (
            <Text
              key={`x-${idx}`}
              style={{
                position: 'absolute',
                left: px(idx) - 14,
                top: height - 18,
                width: 28,
                textAlign: 'center',
                fontSize: 10,
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              {labels[idx]}
            </Text>
          ) : null
        )}
      </View>
    </View>
  );
}
