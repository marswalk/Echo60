import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';

const MESSAGES = [
  'Analyzing your health profile...',
  'Calculating your biological age...',
  'Modeling your health trajectories...',
  'Writing your letter from the future...',
  'Preparing your personalized report...',
];

export function ProcessingScreen() {
  const { navigateTo } = useApp();
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => {
        if (i < MESSAGES.length - 1) return i + 1;
        return i;
      });
    }, 1400);

    const timeout = setTimeout(() => {
      navigateTo('dashboard');
    }, 4200);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigateTo]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Spinner */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-purple-900" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-400 animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-300 animate-spin [animation-duration:1.5s]" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">Processing Your Data</h2>

        <div className="h-8">
          <p
            key={messageIndex}
            className="text-purple-300 text-lg animate-pulse"
          >
            {MESSAGES[messageIndex]}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-8">
          {MESSAGES.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i <= messageIndex ? 'bg-purple-400' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
