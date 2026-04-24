import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

function getMockResponse(userMessage: string, futureAge: number): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes('regret') || lower.includes('mistake')) {
    return `I don't believe in dwelling on regrets — but yes, there were moments I wish I had acted sooner. The good news? You're asking now. That's the only moment that matters. Every choice you make today ripples forward in ways you can't fully predict.`;
  }
  if (lower.includes('hard') || lower.includes('difficult') || lower.includes('easy')) {
    return `Honestly? The hardest part wasn't the change itself — it was believing the change was possible. Once I committed, each day got a little easier. The first week is the hardest. Then it becomes just... life. A better life.`;
  }
  if (lower.includes('happy') || lower.includes('happiness') || lower.includes('content')) {
    return `I'm genuinely happy. Not in a constant-euphoria way, but in a deep, quiet way. I wake up most mornings feeling like I earned this body, these years. That's more than I expected when I was your age.`;
  }
  if (lower.includes('advice') || lower.includes('tell me') || lower.includes('suggest')) {
    return `The most important thing I'd tell you: stop waiting for the perfect moment. The person you're afraid to become — the one who exercises, sleeps well, eats mindfully — you can start being them today. Not tomorrow. Today. It's not a personality transplant; it's just a series of choices.`;
  }
  if (lower.includes('miss') || lower.includes('remember')) {
    return `I remember being you more than you'd think. The uncertainty. The feeling that change is for "other people." But we're not that different. You just have something I didn't — the knowledge of what's possible. Use it.`;
  }

  const defaults = [
    `I've had ${futureAge - 30} years to think about this. The questions you're asking now are exactly the right ones. Keep asking them.`,
    `From where I'm sitting at ${futureAge}, I can tell you: the body remembers every kindness you give it. And every unkindness too. You're building a future right now.`,
    `There's a version of you that makes the changes. And a version that doesn't. I'm proof the first version is possible. What would it mean for you to choose that path?`,
    `I know it feels abstract — the future always does. But I'm real. These years are real. Every healthy habit you start today, I felt the benefit of. Start now.`,
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

export function ChatScreen() {
  const { simulation, healthData, navigateTo } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const futureAge = (simulation?.chronologicalAge ?? 30) + 30;

  useEffect(() => {
    if (simulation && messages.length === 0) {
      const opening: Message = {
        role: 'assistant',
        content: `Hello. I know this is strange — talking to yourself across time. But here I am, at ${futureAge}. 

I've lived through everything you're about to experience. I know your fears. I know your potential. And I'm here to tell you: the choices you make in the next few years matter more than you know.

What would you like to ask me?`,
      };
      setMessages([opening]);
    }
  }, [simulation, futureAge, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userData: { simulation, healthData },
        }),
      });

      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
    } catch {
      // Fallback mock response
      const mock = getMockResponse(input, futureAge);
      setMessages((prev) => [...prev, { role: 'assistant', content: mock }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <button
          onClick={() => navigateTo('dashboard')}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
            {futureAge}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Your Future Self</p>
            <p className="text-emerald-400 text-xs">● Online from {futureAge} years from now</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mr-2 mt-1">
                {futureAge}
              </div>
            )}
            <div
              className={`max-w-xs sm:max-w-md rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-white/10 text-slate-200 rounded-bl-none'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mr-2 mt-1">
              {futureAge}
            </div>
            <div className="bg-white/10 rounded-2xl rounded-bl-none px-4 py-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:200ms]" />
                <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:400ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 py-4 border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="flex gap-3 max-w-2xl mx-auto">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your future self anything..."
            rows={1}
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 resize-none text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all cursor-pointer shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-slate-600 text-xs text-center mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
