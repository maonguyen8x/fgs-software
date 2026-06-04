import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { getSettingsMap } from "@/lib/settings";
import { maskSecret } from "@/lib/ai/mask-secret";
import { AI_SETTING_KEYS } from "@/lib/ai/setting-keys";

const ENV_MAP: Record<string, string | undefined> = {
  ai_provider: process.env.AI_PROVIDER,
  openai_api_key: process.env.OPENAI_API_KEY,
  openai_model: process.env.OPENAI_MODEL,
  google_ai_api_key:
    process.env.GOOGLE_AI_API_KEY ?? process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY,
  gemini_model: process.env.GEMINI_MODEL,
};

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  const settings = await getSettingsMap();

  const fromEnv: Record<string, { masked: string; configured: boolean }> = {};
  const fromDatabase: Record<string, { masked: string; configured: boolean }> = {};

  for (const key of AI_SETTING_KEYS) {
    const envVal = ENV_MAP[key];
    fromEnv[key] = {
      masked: maskSecret(envVal),
      configured: Boolean(envVal?.trim()),
    };
    const dbVal = settings[key];
    fromDatabase[key] = {
      masked: maskSecret(dbVal),
      configured: Boolean(dbVal?.trim()),
    };
  }

  return NextResponse.json({
    fromEnv,
    fromDatabase,
    note: "Values are masked for security. Use Import from .env to copy server environment into database settings.",
  });
}
