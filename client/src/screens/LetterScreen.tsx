import { useApp } from '../context/AppContext';
import { ArrowLeft, MessageCircle, Mail } from 'lucide-react';

function generateCurrentLetter(
  chronoAge: number,
  bioAge: number,
  topHabit: { habit: string; potentialYearsGained: number }
): string {
  const diff = bioAge - chronoAge;
  const concern =
    diff > 3
      ? `My biological age is ${bioAge} — that's ${diff.toFixed(1)} years older than I should be.`
      : diff < -1
        ? `My biological age is actually ${bioAge} — ${Math.abs(diff).toFixed(1)} years younger than my calendar age. I'm doing some things right.`
        : `My biological age is ${bioAge}, roughly in line with my chronological age of ${chronoAge}.`;

  return `Dear Future Me,

I'm writing this at ${chronoAge} years old. ${concern}

I know I've been putting off changes I know I should make. The days blur together, and it's easy to tell myself "I'll start tomorrow." But sitting here, thinking about the person I'll become, I realize tomorrow keeps moving.

The one change I keep ignoring is: ${topHabit.habit}. The research says it could give me back up to ${topHabit.potentialYearsGained} years. That's not a small number. That's birthdays, adventures, mornings with the people I love.

I don't know what your life looks like. I don't know if you made the changes I'm afraid to make. But I hope you did. I hope you looked at this moment — right now — as the turning point.

I'm sorry for the times I didn't take better care of you. You deserved more from me.

With hope,
Your ${chronoAge}-year-old self`;
}

function generateOptimizedLetter(
  chronoAge: number,
  optimizedBioAge: number,
  topHabit: { habit: string; potentialYearsGained: number }
): string {
  const futureAge = chronoAge + 30;
  const diff = futureAge - optimizedBioAge;

  return `Dear ${chronoAge}-year-old me,

It's me — you — at ${futureAge}. I'm writing from the path where you made the changes.

I want you to know: it worked. My biological age right now is ${optimizedBioAge}. I'm ${diff.toFixed(1)} years biologically younger than my calendar age. I feel it every day — in the way I wake up without an alarm, in the energy I have for the people I love.

The biggest shift? ${topHabit.habit}. I remember the moment you decided to actually do it. It didn't happen all at once — nothing real ever does. But each small decision stacked, and stacked, and one day I looked in the mirror and didn't recognize how good I felt.

There were hard days. Weeks where I backslid. But I kept returning to the version of myself I'd decided to become.

The most important thing I want to tell you is this: you have more power over your future than you believe right now. The science is real. The changes are possible. And the version of you that exists on the other side of those changes? They're so grateful you started.

Start today. Not tomorrow.

With love from your future,
Your ${futureAge}-year-old self`;
}

export function LetterScreen() {
  const { simulation, navigateTo } = useApp();

  if (!simulation) return null;

  const { currentBiologicalAge, chronologicalAge, topHabitChange, trajectories } = simulation;
  const optimized = trajectories.find((t) => t.id === 'optimized');
  const optimizedFutureBioAge = optimized?.biologicalAgeAt30Years ?? currentBiologicalAge + 20;

  const currentLetter = generateCurrentLetter(chronologicalAge, currentBiologicalAge, topHabitChange);
  const futureLetter = generateOptimizedLetter(chronologicalAge, optimizedFutureBioAge, topHabitChange);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigateTo('dashboard')}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Letters Across Time</h1>
            <p className="text-slate-400 text-sm">Words from your past and future selves</p>
          </div>
        </div>

        {/* Letter 1: Current Self */}
        <div className="mb-8">
          <p className="text-purple-300 text-xs font-semibold uppercase tracking-widest mb-3 text-center">
            From Your Current Self
          </p>
          <div
            className="rounded-2xl p-8 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #fdf6e3 0%, #f5e6c8 100%)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div
              className="whitespace-pre-line leading-relaxed text-sm"
              style={{ fontFamily: 'Georgia, serif', color: '#3d2b1f' }}
            >
              {currentLetter}
            </div>
            <div
              className="text-right mt-6 text-xs italic"
              style={{ fontFamily: 'Georgia, serif', color: '#7c5c3e' }}
            >
              — Age {chronologicalAge}
            </div>
          </div>
        </div>

        {/* Letter 2: Optimized Future Self */}
        <div className="mb-8">
          <p className="text-emerald-300 text-xs font-semibold uppercase tracking-widest mb-3 text-center">
            From Your Optimized Future Self
          </p>
          <div
            className="rounded-2xl p-8 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div
              className="whitespace-pre-line leading-relaxed text-sm"
              style={{ fontFamily: 'Georgia, serif', color: '#1b5e20' }}
            >
              {futureLetter}
            </div>
            <div
              className="text-right mt-6 text-xs italic"
              style={{ fontFamily: 'Georgia, serif', color: '#2e7d32' }}
            >
              — Age {chronologicalAge + 30}
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigateTo('chat')}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-all cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
            Chat with Future Self
          </button>
          <button
            onClick={() => navigateTo('email')}
            className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold py-3 px-6 rounded-xl transition-all cursor-pointer"
          >
            <Mail className="w-5 h-5 text-purple-300" />
            Email These Letters
          </button>
        </div>
      </div>
    </div>
  );
}
