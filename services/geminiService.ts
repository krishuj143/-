
import { GoogleGenAI } from "@google/genai";
import { ResearchAnalysis } from "../types";

// Helper for Base64 decoding
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const fetchRajasthanCurrentAffairs = async (period: 'weekly' | 'monthly' = 'weekly'): Promise<{text: string, sources: any[]}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Provide a detailed summary of Rajasthan current affairs for the ${period} starting from the current date. 
  Focus on Rajasthan Government (GoR) schemes, state budget implementations, economic review points, and major state events.
  Format the output in professional Hinglish suitable for an RAS aspirant. Use structured bullet points.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return {
    text: response.text || "No data found.",
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const getTrendingResearchTopics = async (): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = "List 5 high-priority trending topics for Rajasthan RAS 2024-25 Mains (like schemes, infrastructure, or social issues). Provide only topic names separated by commas.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    return (response.text || "").split(',').map(t => t.trim()).filter(Boolean);
  } catch (e) {
    return ["Lado Protsahan Yojana", "Rajasthan Solar Policy 2024", "ERCP Project Progress", "Annapurna Rasoi Scheme", "Rajasthan Investment Promotion Scheme (RIPS)"];
  }
};

export const performDeepResearch = async (topic: string): Promise<ResearchAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Act as an RAS Exam Panelist and a Visionary Oracle. Research: "${topic}". 
  Format your response exactly with these sections:
  [SUMMARY]
  Extensive summary.
  [KEY_POINTS]
  • Point 1
  • Point 2
  [CONTEXT]
  Rajasthan specific background.
  [SYLLABUS]
  GS Paper relevance.
  [SHORT_QUESTIONS]
  3 short 2-mark interview questions.
  [LONG_QUESTIONS]
  2 analytical 10-mark writing questions.
  [SCORE]
  A significance tier score between 1 and 100 (1 is elite/highest priority, 100 is low priority).
  [ORACLE]
  (ONLY IF SCORE < 10) A "Magic Oracle" insight: A mystical, prophetic connection about how this topic will transform Rajasthan's future landscape or its hidden critical importance in the upcoming exam.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text || "";
  const extract = (tag: string) => {
    const regex = new RegExp(`\\[${tag}\\]\\s*([\\s\\S]*?)(?=\\[|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : "";
  };

  const parseList = (raw: string) => raw.split('\n')
    .map(line => line.replace(/^[•\-\*\d\.]+\s*/, '').trim())
    .filter(line => line.length > 5);

  const rawScore = parseInt(extract('SCORE')) || 50;

  return {
    summary: extract('SUMMARY'),
    keyPoints: parseList(extract('KEY_POINTS')).slice(0, 6),
    historicalContext: extract('CONTEXT'),
    relevanceToRAS: extract('SYLLABUS'),
    shortQuestions: parseList(extract('SHORT_QUESTIONS')).slice(0, 3),
    longQuestions: parseList(extract('LONG_QUESTIONS')).slice(0, 2),
    significanceScore: rawScore,
    oracleInsight: rawScore < 10 ? extract('ORACLE') : undefined,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || "Reference",
      uri: chunk.web?.uri || "#"
    })) || []
  };
};

export const generateQuiz = async (topic: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 5 RAS-standard MCQs on: ${topic}. Include 4 options and detailed Hindi explanations.`,
  });
  return response.text || "Failed to generate quiz.";
};

export const speakSummary = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say this clearly in a professional tone for a Rajasthan Civil Services aspirant: ${text.substring(0, 600)}` }] }],
    config: {
      responseModalities: ['AUDIO' as any],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (base64Audio) {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBytes = decodeBase64(base64Audio);
    const audioBuffer = await decodeAudioData(audioBytes, audioContext, 24000, 1);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  }
};
