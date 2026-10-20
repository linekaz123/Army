import { GoogleGenAI, Type } from "@google/genai";
import type { FoodAnalysis } from "./types";

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

export function isGeminiConfigured() {
  return Boolean(API_KEY);
}

const FOOD_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Short, friendly name of the food/meal" },
    portion: { type: Type.STRING, description: 'e.g. "1 bowl (~300g)", "2 slices"' },
    calories: { type: Type.NUMBER },
    protein: { type: Type.NUMBER, description: "grams" },
    carbs: { type: Type.NUMBER, description: "grams" },
    fat: { type: Type.NUMBER, description: "grams" },
    confidence: {
      type: Type.NUMBER,
      description: "0 to 1, how confident this estimate is",
    },
    note: {
      type: Type.STRING,
      description: "One short, encouraging nutrition tip (<=12 words). Optional.",
    },
  },
  required: ["name", "portion", "calories", "protein", "carbs", "fat", "confidence"],
};

const SYSTEM_PROMPT = `You are the nutrition-estimation engine inside LinePal, a friendly calorie and macro tracking app.
Given either a food photo or a short text description, identify the food and estimate realistic nutrition values
for the portion shown/described. Use typical home or restaurant serving sizes when portion size is ambiguous.
If several items appear together, combine them into one sensible plate/meal estimate.
Always respond with your best estimate — never refuse. Keep "note" short, warm, and specific to this food.`;

type AnalyzeInput =
  | { kind: "image"; base64: string; mimeType: string; hint?: string }
  | { kind: "text"; description: string };

export async function analyzeFood(input: AnalyzeInput): Promise<FoodAnalysis> {
  if (!API_KEY) {
    throw new Error("GEMINI_NOT_CONFIGURED");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const parts =
    input.kind === "image"
      ? [
          {
            text:
              SYSTEM_PROMPT +
              (input.hint ? `\n\nUser note about this photo: "${input.hint}"` : ""),
          },
          { inlineData: { mimeType: input.mimeType, data: input.base64 } },
        ]
      : [
          {
            text: `${SYSTEM_PROMPT}\n\nFood description from the user: "${input.description}"`,
          },
        ];

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: [{ role: "user", parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema: FOOD_SCHEMA,
      temperature: 0.4,
    },
  });

  const text = response.text;
  if (!text) throw new Error("EMPTY_RESPONSE");

  const parsed = JSON.parse(text) as FoodAnalysis;
  return {
    name: parsed.name ?? "Unknown food",
    portion: parsed.portion ?? "1 serving",
    calories: Math.round(Number(parsed.calories) || 0),
    protein: Math.round(Number(parsed.protein) || 0),
    carbs: Math.round(Number(parsed.carbs) || 0),
    fat: Math.round(Number(parsed.fat) || 0),
    confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.5)),
    note: parsed.note,
  };
}
