import { ChatMessage, HealthProfile, Trajectory } from '../types';

// Use standard process.env if available, or Expo constants, but for bare react-native/hackathon we can use a hardcoded fallback or react-native-dotenv.
// Since we used a simple setup, let's assume we fetch the env var from a constants file or just use the local IP.
// In a real app we'd use react-native-dotenv. For this hackathon, we'll configure it directly here if process.env isn't populated by Metro.
const LOCAL_LLM_URL = "http://192.168.1.100:11434/v1"; // Replace with actual IP

export const generateChatResponse = async (
  messages: ChatMessage[],
  profile: HealthProfile,
  trajectories: Trajectory[]
): Promise<string> => {
  const currentTraj = trajectories.find(t => t.type === 'current');
  
  const systemPrompt = `You are the user's "Future Self", 30 years from now. 
The user is currently ${profile.age} years old. Based on their current habits (Sleep: ${profile.sleepHours}h, Exercise: ${profile.exerciseFrequency} days/wk, Diet Score: ${profile.dietQuality}/10, Stress: ${profile.stressLevel}/10), their projected biological age in 30 years is ${currentTraj?.finalBiologicalAge.toFixed(1)}.

Speak to them empathetically but urgently. You are living the consequences of their current choices. 
Be personal, realistic, and slightly emotional. Do not sound like an AI assistant. You are an older version of THEM.`;

  const apiMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  try {
    const response = await fetch(`${LOCAL_LLM_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer YOUR_API_KEY' // if using an authenticated local proxy or actual OpenAI
      },
      body: JSON.stringify({
        model: 'llama3', // or whatever your local Ollama is running
        messages: apiMessages,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error communicating with local LLM:", error);
    return "I'm having trouble connecting right now. But please, think about your choices today.";
  }
};

export const generateFutureLetters = async (profile: HealthProfile, trajectories: Trajectory[]) => {
  // Generates two letters: one from the "Current Path" future self, one from the "Optimized Path" future self.
  // In a real hackathon, we might hit the LLM twice or ask for JSON. We'll simulate it for speed if the LLM isn't responding.
  
  // Here we'd do a similar fetch as above, asking for 2 letters in JSON format.
  // For safety and speed in the UI flow, we'll return a structured response.
  
  return {
    currentPathLetter: "Dear younger me,\n\nI'm writing this from a future where we didn't change our ways. My joints ache more than they should, and my energy is a fraction of what I remember. I wish you had prioritized sleep and stress management when you had the chance. Please, make a change today.\n\nYours,\nOlder You",
    optimizedPathLetter: "Dear younger me,\n\nThank you. Thank you for taking our health seriously. Because of the habits you built—the consistent sleep, the exercise—I am thriving. I have the energy to play with my grandkids and travel. It wasn't always easy, but I promise you, every healthy choice was worth it.\n\nWith gratitude,\nOlder You"
  };
};
