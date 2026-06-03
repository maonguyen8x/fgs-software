import { getSettingsMap } from "@/lib/settings";
import { AI_SETTING_KEYS } from "./setting-keys";
import { readEnvApiKey, readEnvModel } from "./env-keys";
import { normalizeGeminiModel, DEFAULT_GEMINI_MODEL } from "@/lib/chat/providers/gemini";
import { isUsableApiKey } from "./api-key";

export { AI_SETTING_KEYS };

function pickApiKey(env: string | null, db: string | undefined): string | null {
  if (env && isUsableApiKey(env)) return env;
  if (isUsableApiKey(db)) return db!.trim();
  return null;
}

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
  const envOpenai = readEnvApiKey("openai");
  const envGemini = readEnvApiKey("gemini");

  const openaiApiKey = pickApiKey(envOpenai, dbOpenai);
  const googleAiApiKey = pickApiKey(envGemini, dbGemini);

  const hasDb = Boolean(dbOpenai || dbGemini || settings.ai_provider);
  const hasEnv = Boolean(envOpenai || envGemini || process.env.AI_PROVIDER);

  const openaiModel =
    settings.openai_model?.trim() || readEnvModel(["OPENAI_MODEL"], "gpt-4o-mini");
  const rawGeminiModel =
    settings.gemini_model?.trim() || readEnvModel(["GEMINI_MODEL"], DEFAULT_GEMINI_MODEL);
  const geminiModel = normalizeGeminiModel(rawGeminiModel);

  return {
    provider:
      settings.ai_provider?.trim() ||
      readEnvModel(["AI_PROVIDER"], "auto").toLowerCase() ||
      "auto",
    openaiApiKey,
    openaiModel,
    googleAiApiKey,
    geminiModel,
    source: hasDb && hasEnv ? "mixed" : hasDb ? "database" : "environment",
  };
}
