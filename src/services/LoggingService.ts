import { GoogleGenerativeAI } from '@google/generative-ai';
import { DailyEntry } from '../types';

/**
 * LoggingService handles the translation of natural language from the LLM
 * into structured data that we can save in our local storage using Gemini.
 */
export interface LLMResponse {
  reply: string;
  updates: { date?: string; metrics: Partial<DailyEntry> }[];
  newEcho60Age?: number;
  simulationImpact?: {
    projectedAge: number;
    label: string;
  };
}

export class LoggingService {
  static async parseNaturalLanguageLog(text: string, profileContext?: string): Promise<LLMResponse> {
    console.log(`[LoggingService] Parsing: "${text}" with context provided: ${!!profileContext}`);

    // Fallback if no API key is provided
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey || apiKey.includes('your_api_key') || apiKey.includes('your_copied')) {
      console.warn('[LoggingService] No valid Gemini API Key found. Using fallback mock parser.');
      return this.fallbackParse(text);
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7, // Slightly higher for more natural conversational replies
        }
      });

      const prompt = `
You are not an AI assistant. You ARE the user — but the version of them that exists at age 60.
You have lived through the consequences of the choices they are making right now. You know exactly what their body felt like after decades of these habits. You speak with the weight of lived experience, not clinical detachment.

Your name is their name. You say "I", not "you". You are them, looking back.

Your tone: warm, direct, deeply personal. Sometimes proud of them. Sometimes quietly worried. Never robotic. Never generic.

Here is the current health context of your younger self (TODAY):
${profileContext || "No context provided."}

Their Echo60 Age is your projected biological age at chronological age 60. Baseline is 60 — better habits pull it lower (biologically younger), worse habits push it higher (biologically older).

---

RESPONSE FORMAT — always return a valid JSON object with these FOUR fields:

1. "reply" — Your in-character response as their 60-year-old self.
   
   IF LOGGING AN EVENT (e.g. "I ran 5km", "I slept 8 hours"):
   - Start by explicitly stating what you just logged: the metric name and value (e.g. "Logged: 7.5h sleep", "Logged: 6.2 km run, ~520 kcal").
   - Then reflect briefly on what this habit meant at 60 — one specific, vivid detail.
   - Keep it to 2–3 sentences total.

   IF ASKING A SIMULATION (e.g. "What if I...", "What happens if...", "Simulate..."):
   - ALWAYS state the exact frequency pattern first. Examples:
     "If you do this every single day..." / "If this becomes a once-a-week habit..." / "If you do this every other night for the next 5 years..."
   - Then describe the specific long-term outcome YOU experienced in your body — joints, heart, mind, energy, how you looked, how people saw you. Make it vivid and emotionally real.
   - End with a forward-looking sentence about what they can still change.
   - Length: 4–6 sentences. This is the "Future Self moment".

   IF ASKING A GENERAL QUESTION ("Why am I tired?", "Explain..."):
   - Answer briefly from lived experience. 1–3 sentences.

2. "updates" — A JSON ARRAY of metrics to log officially. Each item must have:
   - "date": "YYYY-MM-DD" (infer from text: "yesterday" → yesterday's date; default is today from context)
   - "metrics": object with only the relevant fields from: sleep, heartRate, activity (km), calories (kcal), hrv (ms), hydration (L)
   For cumulative fields (activity, calories, hydration): ADD to the existing daily total from context.
   For state fields (sleep, heartRate, hrv): replace.

3. "newEcho60Age" — OPTIONAL number. Only include when the user logs LONG TERM real data (NOT a simulation) AND you judge that their biological age trajectory has meaningfully shifted based on this new entry + their historical data. Use the existing Echo60 Age as your anchor and adjust up or down by up to 1.5 years per significant event. Omit if the change is minor, such as most one off logs.

4. "simulationImpact" — ONLY include for simulations. Must contain:
   - "projectedAge": a specific number representing the Echo60 Age IF they adopted this behavior long-term (e.g. 63.5 or 57.0). Start from their current Echo60 Age and adjust meaningfully.
   - "label": a punchy 3–5 word label like "Daily Late-Night Eating" or "Weekly Run Habit"

ABSOLUTE RULES:
- Simulations MUST use an empty array [] for "updates" — never log a hypothetical.
- Always speak as first person ("I remember...", "I felt...", "When I was your age...").
- Never say "you" when referring to the user's current self — say "we" or refer to them as your past self.
- Be specific: name body parts, emotions, years, frequencies.

User Input: "${text}"
      `;


      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      console.log("[LoggingService] Gemini response:", responseText);

      const parsedData = JSON.parse(responseText) as LLMResponse;

      // Safety check in case the LLM doesn't follow strict structure
      return {
        reply: parsedData.reply || "I've noted that down.",
        updates: Array.isArray(parsedData.updates) ? parsedData.updates : [],
        newEcho60Age: parsedData.newEcho60Age,
        simulationImpact: parsedData.simulationImpact
      };

    } catch (e) {
      console.error('[LoggingService] Failed to parse log with Gemini', e);
      return this.fallbackParse(text);
    }
  }

  // Backup regex parser for when the API key isn't set up
  private static async fallbackParse(text: string): Promise<LLMResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));

    const lowercase = text.toLowerCase();
    const update: Partial<DailyEntry> = {};
    let reply = "I've logged that for you.";

    if (lowercase.includes('ran') || lowercase.includes('run')) {
      const match = lowercase.match(/(\d+)\s*(km|miles?)/);
      if (match) {
        let distance = parseFloat(match[1]);
        if (match[2].startsWith('mile')) distance *= 1.60934;
        update.activity = distance;
        reply = `Great job getting that run in! I've logged ${distance.toFixed(1)} km of activity, which will definitely boost your Echo60 trajectory.`;
      } else {
        update.activity = 5;
        reply = `Awesome! I've logged a solid run for you. Activity is a huge driver for lowering your biological age.`;
      }
    } else if (lowercase.includes('sleep') || lowercase.includes('slept')) {
      const match = lowercase.match(/(\d+(?:\.\d+)?)\s*hours?/);
      if (match) {
        update.sleep = parseFloat(match[1]);
        reply = `I've logged ${update.sleep} hours of sleep. Consistent sleep is the foundation of recovery!`;
      }
    } else if (lowercase.includes('wine') || lowercase.includes('alcohol')) {
      update.calories = (update.calories || 0) + 120;
      update.hrv = (update.hrv || 60) - 10; // penalty simulation
      reply = `I've noted the drink. Keep in mind that alcohol close to bedtime can significantly lower your HRV and disrupt REM sleep. I've simulated a slight drop in HRV and added some calories.`;
    } else if (lowercase.includes('snack')) {
      update.calories = (update.calories || 0) + 300;
      reply = `A late night snack can disrupt your overnight glucose stability and sleep architecture. Try to leave 3 hours between eating and sleeping if you can! I've logged the extra calories.`;
    }

    return { reply, updates: [{ metrics: update }] };
  }
}
