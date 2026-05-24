import { getSettingsMap } from "@/lib/settings";
import { AI_SETTING_KEYS } from "./setting-keys";

export { AI_SETTING_KEYS };

export interface AiRuntimeConfig {
  provider: string;
  openaiApiKey: string | null;
  openaiModel: string;
  googleAiApiKey: string | null;
  geminiModel: string;
  source: "database" | "environment" | "mixed";
}

export async function getAiRuntimeConfig(): Promise<AiRuntimeConfig> {
  const settings = await getSettingsMap();

  const dbOpenai = settings.openai_api_key?.trim();
  const dbGemini = settings.google_ai_api_key?.trim();
  const envOpenai = process.env.OPENAI_API_KEY?.trim();
  const envGemini = process.env.GOOGLE_AI_API_KEY?.trim();

  const openaiApiKey = dbOpenai || envOpenai || null;
  const googleAiApiKey = dbGemini || envGemini || null;

  const hasDb = Boolean(dbOpenai || dbGemini || settings.ai_provider);
  const hasEnv = Boolean(envOpenai || envGemini || process.env.AI_PROVIDER);

  return {
    provider: settings.ai_provider?.trim() || process.env.AI_PROVIDER?.toLowerCase() || "auto",
    openaiApiKey,
    openaiModel: settings.openai_model?.trim() || process.env.OPENAI_MODEL || "gpt-4o-mini",
    googleAiApiKey,
    geminiModel: settings.gemini_model?.trim() || process.env.GEMINI_MODEL || "gemini-2.0-flash",
    source: hasDb && hasEnv ? "mixed" : hasDb ? "database" : "environment",
  };
}
