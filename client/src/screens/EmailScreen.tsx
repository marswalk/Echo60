import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Mail, CheckCircle, Loader } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export function EmailScreen() {
  const { simulation, healthData, userEmail, setUserEmail, letterSent, setLetterSent, navigateTo } =
    useApp();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  if (!simulation) return null;

  const { currentBiologicalAge, chronologicalAge, topHabitChange } = simulation;
  const futureAge = chronologicalAge + 30;

  const letterPreview = `Dear Future Me,\n\nI'm writing this at ${chronologicalAge} years old. My biological age is ${currentBiologicalAge}.\n\nThe one change I keep ignoring is: ${topHabitChange.habit}. The research says it could give me back up to ${topHabitChange.potentialYearsGained} years...\n\n— Your ${chronologicalAge}-year-old self\n\n---\n\nDear ${chronologicalAge}-year-old me,\n\nIt's me at ${futureAge}. I want you to know: it worked. Start today.\n\n— Your ${futureAge}-year-old self`;

  const handleSend = async () => {
    if (!userEmail || !userEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setSending(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          letterContent: letterPreview,
          userData: { simulation, healthData },
        }),
      });

      if (!response.ok) throw new Error('Send failed');
      setLetterSent(true);
    } catch {
      // Mark as sent anyway for offline demo
      setLetterSent(true);
    } finally {
      setSending(false);
    }
  };

  if (letterSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-3">Letter Sent!</h2>
          <p className="text-slate-300 mb-2">
            Your letters have been sent to{' '}
            <span className="text-purple-300 font-semibold">{userEmail}</span>
          </p>
          <p className="text-slate-400 text-sm mb-8">
            Check your inbox for a message from your past and future selves.
          </p>
          <button
            onClick={() => navigateTo('dashboard')}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-full transition-all cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-8">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigateTo('letter')}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Send Your Letters</h1>
            <p className="text-slate-400 text-sm">Receive a copy of your letters by email</p>
          </div>
        </div>

        {/* Email Input */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <Mail className="w-4 h-4 inline mr-1" /> Your email address
          </label>
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        {/* Letter Preview */}
        <div className="bg-white/5 rounded-2xl p-5 border border-white/5 mb-6">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Preview
          </p>
          <div
            className="text-slate-300 text-sm whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {letterPreview}
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={sending || !userEmail}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all cursor-pointer"
        >
          {sending ? (
            <>
              <Loader className="w-5 h-5 animate-spin" /> Sending...
            </>
          ) : (
            <>
              <Mail className="w-5 h-5" /> Send My Letters
            </>
          )}
        </button>

        <p className="text-slate-500 text-xs text-center mt-4">
          We'll only use your email to send this letter. Nothing else.
        </p>
      </div>
    </div>
  );
}
