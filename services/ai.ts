import { GoogleGenAI } from "@google/genai";
import { Trade } from '../types';

// Initializing the GenAI client with named parameter
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Sends trade history to Gemini to generate coaching insights.
 */
export const analyzeJournalPatterns = async (trades: Trade[]): Promise<string> => {
  if (!trades || trades.length < 3) {
    return "### 📊 More Data Required\n\nPlease log at least 3-5 completed trades to unlock AI Coaching. I need to observe your execution patterns and emotional responses over multiple data points.";
  }

  const tradeContext = trades.slice(0, 50).map(t => ({
    symbol: t.symbol,
    pnl: t.pnl,
    type: t.type,
    setup: t.setups?.join(', ') || 'N/A',
    mistakes: t.mistakes?.join(', ') || 'None',
    mood: t.mood || 'Neutral',
    rating: t.rating || 0,
    notes: t.notes?.substring(0, 150) || '',
    rr: t.rrRatio
  }));

  const prompt = `
    You are 'Adhyayan AI', a elite performance coach for professional derivatives traders.
    Review the following journal history:
    
    ${JSON.stringify(tradeContext, null, 2)}
    
    Tasks:
    1. Identify the **Golden Setup**: Which strategy or setup is consistently producing high-quality results?
    2. Identify the **Psychological Leak**: Connect emotions (mood/emotions) to the biggest P/L losses.
    3. Identify the **Strategic Error**: Point out recurring execution mistakes (e.g., chasing price, moving SL).
    4. Provide the **High-Performance Directive**: Give the trader ONE specific rule for the next 7 days.
    
    Style: Brutally honest but encouraging. Use professional trading terminology. Format in clean Markdown with bold highlights.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
        topP: 0.95,
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });

    return response.text || "Coach is currently analyzing the tape. Please check back shortly.";
  } catch (error) {
    console.error("Gemini AI Analysis Error:", error);
    return "### ⚠️ Analysis Interrupted\n\nI was unable to complete the analysis. This usually happens due to a network timeout or API quota limit. Please try again in 5 minutes.";
  }
};
