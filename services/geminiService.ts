import { GoogleGenAI } from "@google/genai";
import { InitialContext, FullContext, AgendaItem, ChallengeCardData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const contextToPrompt = (context: InitialContext | FullContext) => {
    let prompt = `
        Customer Name: ${context.customerName}
        Executives Attending: ${context.executives}
        Line of Business: ${context.lineOfBusiness}
        Areas of Interest: ${context.areasOfInterest}
        Customer Expectations: ${context.customerExpectations}
    `;
    if ('followUpAnswers' in context && context.followUpAnswers.length > 0) {
        prompt += `\nFollow-up Answers:\n${context.followUpAnswers.join('\n- ')}`;
    }
    return prompt;
};


export const analyzeContext = async (context: InitialContext, systemInstruction: string): Promise<string[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Context:\n${contextToPrompt(context)}`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
            },
        });
        const jsonText = response.text.trim();
        const questions = JSON.parse(jsonText);
        return Array.isArray(questions) ? questions : [];
    } catch (error) {
        console.error("Error analyzing context:", error);
        return [];
    }
};

export const deepResearch = async (context: FullContext, systemInstruction: string, referenceAgenda: string): Promise<{ agenda: AgendaItem[], challengeCards: ChallengeCardData[] }> => {
    const prompt = `Full Context:\n${contextToPrompt(context)}\n\nReference Agenda:\n${referenceAgenda}`;
    
    // Fix: Removed responseMimeType and responseSchema as they are not supported with the googleSearch tool.
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction,
            tools: [{ googleSearch: {} }],
        },
    });

    // Fix: Added robust JSON parsing as googleSearch does not guarantee JSON output.
    let result;
    try {
        const jsonText = response.text.trim();
        // The model might wrap the JSON in a markdown code block.
        const match = jsonText.match(/```json\n([\s\S]*?)\n```/);
        if (match && match[1]) {
            result = JSON.parse(match[1]);
        } else {
            result = JSON.parse(jsonText);
        }
    } catch (e) {
        console.error('Failed to parse JSON from deepResearch:', response.text, e);
        throw new Error('Could not get a valid JSON response from the model for deep research.');
    }
    
    // Add IDs to cards and extract sources from grounding metadata if available
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingMetadata?.map(chunk => chunk.web).filter(Boolean) as { title: string, uri: string }[] || [];

    const challengeCardsWithIds = result.challengeCards.map((card: ChallengeCardData, index: number) => {
      // Prioritize sources from grounding metadata, then from the model's generation
      const finalSources = card.supportingSources && card.supportingSources.length > 0 ? card.supportingSources : sources.slice(index*2, (index+1)*2);
      return {
        ...card,
        id: `card-${Date.now()}-${index}`,
        supportingSources: finalSources,
      }
    });

    return { agenda: result.agenda, challengeCards: challengeCardsWithIds };
};

export const generateNewCards = async (topic: string, context: FullContext, systemInstruction: string): Promise<ChallengeCardData[]> => {
    const prompt = `Generate cards for this topic: "${topic}".\n\nUse this overall event context:\n${contextToPrompt(context)}`;
    
    // Fix: Removed responseMimeType and responseSchema as they are not supported with the googleSearch tool.
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction,
            tools: [{ googleSearch: {} }],
        },
    });

    // Fix: Added robust JSON parsing as googleSearch does not guarantee JSON output.
    let newCards;
    try {
        const jsonText = response.text.trim();
        // The model might wrap the JSON in a markdown code block.
        const match = jsonText.match(/```json\n([\s\S]*?)\n```/);
        if (match && match[1]) {
            newCards = JSON.parse(match[1]);
        } else {
            newCards = JSON.parse(jsonText);
        }
    } catch (e) {
        console.error('Failed to parse JSON from generateNewCards:', response.text, e);
        throw new Error('Could not get a valid JSON response from the model for new cards.');
    }
    
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingMetadata?.map(chunk => chunk.web).filter(Boolean) as { title: string, uri: string }[] || [];
    
    return newCards.map((card: ChallengeCardData, index: number) => ({
        ...card,
        id: `new-card-${Date.now()}-${index}`,
        supportingSources: card.supportingSources && card.supportingSources.length > 0 ? card.supportingSources : sources.slice(index, index + 2),
    }));
};
