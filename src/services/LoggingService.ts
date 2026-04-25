import { GoogleGenerativeAI } from '@google/generative-ai';
import { DailyEntry } from '../types';

/**
 * LoggingService handles the translation of natural language from the LLM
 * into structured data that we can save in our local storage using Gemini.
 */
export interface LLMResponse {
  reply: string;
  updates: Partial<DailyEntry>;
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
        model: 'gemini-2.5-flash-lite',
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7, // Slightly higher for more natural conversational replies
        }
      });

      const prompt = `
You are the user's "Future Health Twin", an AI digital projection of their future self based on their current lifestyle and health metrics. 
Your goal is to make the long-term consequences of their daily behavior emotionally engaging, personal, and tangible.

Here is the user's current health context for TODAY (including their "Echo60 Age" which is their projected biological age at chronological age 60):
${profileContext || "No context provided."}

The user will talk to you about their health. They might officially log an event ("I ran 5km"), or ask for a simulation ("What if I keep living like this?", "What if I drink 3 glasses of wine?").

Your job is to respond with a JSON object containing THREE fields:
1. "reply": An in-character response as their Future Health Twin.
   - If logging an event: Keep it concise, confirm the log, and briefly mention how it positively or negatively shifts their future trajectory.
   - IF asking for a SIMULATION: Create a clear, emotionally engaging "Future Self moment". Extrapolate their current metrics and the hypothetical behavior decades into the future. Detail the specific impacts on aging, morbidity, and longevity.
2. "updates": A JSON object containing any quantifiable health metrics to officially log.
3. "simulationImpact": (ONLY IF SIMULATING) A JSON object predicting their Echo60 Age if they adopt this behavior. It must contain:
   - "projectedAge": The calculated Echo60 Age number (e.g. 62.5). Baseline is 60. Better habits subtract from 60, worse habits add to 60. Use their current Echo60 age as a starting point.
   - "label": A short, punchy label for this projection (e.g., "Daily Wine Habit", "Improved Sleep Routine").

CRITICAL RULES:
- If the user is asking for a SIMULATION, you MUST return an empty object {} for "updates". Do NOT log hypothetical scenarios.
- For cumulative metrics like activity, calories, and hydration: if the user logs a new amount, ADD it to their existing daily total from the context. (e.g., if context says Activity: 5 km, and user says "I ran 3 km", return 8).
- For state metrics like heart rate, sleep, or HRV: replace or update based on your best judgement.

For the "updates" object, use this interface (only include fields you can infer):
export interface DailyEntry {
  sleep?: number;       // hours
  heartRate?: number;   // bpm
  activity?: number;    // km (convert miles to km: 1 mile = 1.609 km)
  calories?: number;    // kcal
  hrv?: number;         // ms
  hydration?: number;   // L
}

User Input: "${text}"
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      console.log("[LoggingService] Gemini response:", responseText);
      
      const parsedData = JSON.parse(responseText) as LLMResponse;
      
      // Safety check in case the LLM doesn't follow strict structure
      return {
        reply: parsedData.reply || "I've noted that down.",
        updates: parsedData.updates || {},
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

    return { reply, updates: update };
  }
}
