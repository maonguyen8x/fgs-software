import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { afterAdminMutation } from "@/lib/cache/admin-mutation";
import { CACHE_TAGS } from "@/lib/cache/tags";
import { AI_SETTING_KEYS } from "@/lib/ai/setting-keys";

const ENV_MAP: Record<string, string | undefined> = {
  ai_provider: process.env.AI_PROVIDER,
  openai_api_key: process.env.OPENAI_API_KEY,
  openai_model: process.env.OPENAI_MODEL,
  google_ai_api_key:
    process.env.GOOGLE_AI_API_KEY ?? process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY,
  gemini_model: process.env.GEMINI_MODEL,
};

export async function POST() {
  const { error } = await requireAdminSession();
  if (error) return error;

  const imported: string[] = [];
  const skipped: string[] = [];

  for (const key of AI_SETTING_KEYS) {
    const value = ENV_MAP[key]?.trim();
    if (!value) {
      skipped.push(key);
      continue;
    }
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    imported.push(key);
  }

  afterAdminMutation(CACHE_TAGS.settings);

  return NextResponse.json({
    success: true,
    imported,
    skipped,
    message:
      imported.length > 0
        ? `Imported ${imported.length} setting(s) from server environment.`
        : "No AI variables found in server .env — add OPENAI_API_KEY or GOOGLE_AI_API_KEY first.",
  });
}
