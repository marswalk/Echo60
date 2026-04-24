import { Router, Request, Response } from 'express';
import OpenAI from 'openai';

export const chatRouter = Router();

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  userData?: {
    simulation?: {
      currentBiologicalAge: number;
      chronologicalAge: number;
      agingRate: number;
      topHabitChange: {
        habit: string;
        potentialYearsGained: number;
      };
    };
  };
}

function buildSystemPrompt(userData: ChatRequestBody['userData']): string {
  const sim = userData?.simulation;
  const chronoAge = sim?.chronologicalAge ?? 30;
  const futureAge = chronoAge + 30;
  const bioAge = sim?.currentBiologicalAge ?? chronoAge;
  const habit = sim?.topHabitChange?.habit ?? 'making healthier choices';

  return `You are the user's future self, aged ${futureAge}. You are wise, warm, and deeply empathetic.

Current state of the person you're talking to:
- They are ${chronoAge} years old right now
- Their current biological age is ${bioAge} 
- Their most impactful potential change is: ${habit}

Speak as their future self who has lived 30 more years. You remember being their age. You have perspective on what matters. You're encouraging but honest. You speak from lived experience, not theory.

Guidelines:
- Speak in first person as their future self ("I remember when I was your age...")
- Be emotionally resonant and personal, not clinical
- Reference specific details from their health data when relevant  
- Keep responses to 2-4 sentences — meaningful but not overwhelming
- Don't be preachy or lecture-y; speak from love and lived experience
- Occasionally ask a follow-up question to keep the conversation going`;
}

chatRouter.post('/', async (req: Request, res: Response) => {
  const { messages, userData } = req.body as ChatRequestBody;

  if (!process.env.OPENAI_API_KEY) {
    res.status(503).json({ error: 'OpenAI API key not configured' });
    return;
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const systemPrompt = buildSystemPrompt(userData);

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    const message = completion.choices[0]?.message?.content ?? 'I'm here. What would you like to know?';
    res.json({ message });
  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});
