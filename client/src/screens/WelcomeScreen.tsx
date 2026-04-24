import { useApp } from '../context/AppContext';
import { Heart, Brain, Zap, ArrowRight } from 'lucide-react';

export function WelcomeScreen() {
  const { navigateTo } = useApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-white mb-2">
            Echo<span className="text-purple-400">60</span>
          </h1>
          <p className="text-purple-300 text-lg">A message from your future self</p>
        </div>

        <p className="text-slate-300 text-xl mb-12 leading-relaxed">
          What if you could hear from the person you'll become in 30 years? Echo60 calculates your
          biological age, shows you three possible futures, and lets you chat with who you'll be at
          60.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Heart, label: 'Health Assessment', desc: '5-minute questionnaire' },
            { icon: Brain, label: 'Biological Age', desc: 'Science-based calculation' },
            { icon: Zap, label: 'Future Trajectories', desc: 'See your possible futures' },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <Icon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-white font-semibold text-sm">{label}</div>
              <div className="text-slate-400 text-xs mt-1">{desc}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigateTo('questionnaire')}
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 px-10 rounded-full text-lg transition-all transform hover:scale-105 flex items-center gap-2 mx-auto cursor-pointer"
        >
          Begin Your Journey <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-slate-500 text-sm mt-6">
          Your data stays on your device. Nothing is stored without your permission.
        </p>
      </div>
    </div>
  );
}
