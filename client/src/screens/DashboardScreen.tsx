import { useApp } from '../context/AppContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MessageCircle, FileText, Mail, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function DashboardScreen() {
  const { simulation, healthData, navigateTo } = useApp();

  if (!simulation) return null;

  const { currentBiologicalAge, chronologicalAge, trajectories, topHabitChange } = simulation;
  const ageDiff = currentBiologicalAge - chronologicalAge;

  // Build chart data — one point per year, one entry per trajectory
  const chartData = trajectories[0].points.map((_, i) => {
    const entry: Record<string, number> = {
      year: trajectories[0].points[i].age,
    };
    trajectories.forEach((t) => {
      entry[t.label] = t.points[i].biologicalAge;
    });
    return entry;
  });

  const AgeDiffIcon = ageDiff > 1 ? TrendingUp : ageDiff < -1 ? TrendingDown : Minus;
  const ageDiffColor =
    ageDiff > 1 ? 'text-red-400' : ageDiff < -1 ? 'text-emerald-400' : 'text-blue-400';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">
            Echo<span className="text-purple-400">60</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Your Health Report</p>
        </div>

        {/* Biological Age Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
          <p className="text-slate-400 text-sm mb-2">Your Biological Age</p>
          <div className="text-7xl font-bold text-white mb-2">{currentBiologicalAge}</div>
          <p className="text-slate-400 text-sm">
            Chronological age: <span className="text-white font-semibold">{chronologicalAge}</span>
          </p>
          <div className={`flex items-center justify-center gap-2 mt-3 ${ageDiffColor}`}>
            <AgeDiffIcon className="w-5 h-5" />
            <span className="font-semibold">
              {ageDiff > 0 ? `+${ageDiff.toFixed(1)} years older` : ageDiff < 0 ? `${ageDiff.toFixed(1)} years younger` : 'Right on track'}{' '}
              than your chronological age
            </span>
          </div>
          {healthData.sex && (
            <p className="text-slate-500 text-xs mt-2">
              Based on lifestyle, biometrics, and medical history
            </p>
          )}
        </div>

        {/* Trajectories Chart */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-white font-bold text-xl mb-1">Your 30-Year Trajectories</h2>
          <p className="text-slate-400 text-sm mb-4">Biological age over time across 3 scenarios</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="year"
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                label={{ value: 'Calendar Age', position: 'insideBottom', offset: -2, fill: '#94a3b8', fontSize: 12 }}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                label={{ value: 'Biological Age', angle: -90, position: 'insideLeft', offset: 15, fill: '#94a3b8', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(15,23,42,0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#f1f5f9',
                }}
                formatter={(value, name) => [`${value} yrs`, name]}
                labelFormatter={(label) => `Calendar age: ${label}`}
              />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              {trajectories.map((t) => (
                <Line
                  key={t.id}
                  type="monotone"
                  dataKey={t.label}
                  stroke={t.color}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>

          {/* Trajectory summaries */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            {trajectories.map((t) => (
              <div
                key={t.id}
                className="rounded-xl p-3 text-sm"
                style={{ background: `${t.color}15`, border: `1px solid ${t.color}40` }}
              >
                <div className="font-semibold mb-1" style={{ color: t.color }}>
                  {t.label}
                </div>
                <p className="text-slate-400 text-xs mb-1">{t.description}</p>
                <p className="text-white text-xs">
                  Age at 30 yrs:{' '}
                  <span className="font-bold">{t.biologicalAgeAt30Years}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Habit Change */}
        <div className="bg-gradient-to-r from-purple-900/60 to-purple-800/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-start gap-4">
            <div className="bg-purple-500/20 rounded-xl p-3 shrink-0">
              <TrendingDown className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <p className="text-purple-300 text-xs font-semibold uppercase tracking-wider mb-1">
                Your #1 Change
              </p>
              <h3 className="text-white font-bold text-lg mb-1">{topHabitChange.habit}</h3>
              <p className="text-emerald-400 text-sm font-semibold mb-2">{topHabitChange.impact}</p>
              <p className="text-slate-300 text-sm leading-relaxed">{topHabitChange.description}</p>
              <div className="mt-3 inline-flex items-center gap-2 bg-emerald-900/40 border border-emerald-500/30 rounded-lg px-3 py-1">
                <span className="text-emerald-400 font-bold text-sm">
                  +{topHabitChange.potentialYearsGained} years
                </span>
                <span className="text-slate-400 text-xs">potential lifespan gain</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => navigateTo('letter')}
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer"
          >
            <FileText className="w-5 h-5 text-purple-300" />
            Read Your Letters
          </button>
          <button
            onClick={() => navigateTo('chat')}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-xl transition-all cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
            Chat with Future Self
          </button>
          <button
            onClick={() => navigateTo('email')}
            className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold py-3 px-4 rounded-xl transition-all cursor-pointer"
          >
            <Mail className="w-5 h-5 text-purple-300" />
            Email My Letter
          </button>
        </div>
      </div>
    </div>
  );
}
