import { GoogleGenerativeAI } from '@google/generative-ai';
import { DailyEntry } from '../types';

/**
 * LoggingService handles the translation of natural language from the LLM
 * into structured data that we can save in our local storage using Gemini.
 */
export interface LLMResponse {
  reply: string;
  updates: Partial<DailyEntry>;
}

export class LoggingService {
  static async parseNaturalLanguageLog(text: string): Promise<LLMResponse> {
    console.log(`[LoggingService] Parsing: "${text}"`);
    
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
You are a "digital twin" health assistant. The user will talk to you about their health, diet, activity, or sleep.
They might log an actual event (e.g. "I ran 5km"), or ask for a simulation/advice (e.g. "What if I eat a late night snack?").

Your job is to respond with a JSON object containing TWO fields:
1. "reply": A short, conversational, in-character response. Encourage healthy behaviors and gently warn against or explain the consequences of unhealthy behaviors (like late night snacking or alcohol).
2. "updates": A JSON object containing any quantifiable health metrics you can extract or infer. 

For the "updates" object, use this interface (only include fields you can infer):
export interface DailyEntry {
  sleep?: number;       // hours
  heartRate?: number;   // bpm
  activity?: number;    // km (convert miles to km: 1 mile = 1.609 km)
  calories?: number;    // kcal (e.g. glass of wine = ~120 kcal, late night snack = ~300 kcal)
  hrv?: number;         // ms
  hydration?: number;   // L (convert cups/glasses to liters: 1 cup = 0.24 L)
}

If no data can be inferred for "updates", return an empty object {} for it.

User Input: "${text}"
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      console.log("[LoggingService] Gemini response:", responseText);
      
      const parsedData = JSON.parse(responseText) as LLMResponse;
      
      // Safety check in case the LLM doesn't follow strict structure
      return {
        reply: parsedData.reply || "I've noted that down.",
        updates: parsedData.updates || {}
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
