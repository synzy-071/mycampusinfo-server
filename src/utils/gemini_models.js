import fetch from "node-fetch";

export async function listGeminiModels(apiKey) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Gemini models");
  }

  const data = await res.json();
  return data.models || [];
}
export function getGenerateContentModels(models) {
  return models.filter(
    m => m.supportedGenerationMethods?.includes("generateContent")
  );
}
