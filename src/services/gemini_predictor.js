import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  listGeminiModels,
  getGenerateContentModels
} from "../utils/gemini_models.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

let cachedModelName = null;

// ✅ THIS IS A FUNCTION, NOT A CLASS
export async function getGeminiModel() {
  if (cachedModelName) {
    return genAI.getGenerativeModel({ model: cachedModelName });
  }

  const models = await listGeminiModels(process.env.GEMINI_API_KEY);
  const usableModels = getGenerateContentModels(models);

  if (!usableModels.length) {
    throw new Error("No Gemini models support generateContent");
  }

  const preferredOrder = [
    "models/gemini-1.0-pro",
    "models/gemini-pro",
  ];

  const selected =
    preferredOrder.find(p =>
      usableModels.some(m => m.name === p)
    ) || usableModels[0].name;

  cachedModelName = selected.replace("models/", "");

  console.log("✅ Using Gemini model:", cachedModelName);

  return genAI.getGenerativeModel({ model: cachedModelName });
}

// Optional helper
export async function runGeminiPrediction(prompt) {
  const model = await getGeminiModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
}
