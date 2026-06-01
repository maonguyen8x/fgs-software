import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { upsertEnvFileVars } from "@/lib/env/env-file";
import { logger } from "@/lib/logger";

export async function POST() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const [settings, providers] = await Promise.all([
      prisma.setting.findMany({
        where: {
          key: {
            in: ["ai_provider", "openai_api_key", "openai_model", "google_ai_api_key", "gemini_model"],
          },
        },
      }),
      prisma.aiProvider.findMany({ where: { isEnabled: true }, orderBy: { order: "asc" } }),
    ]);

    const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    const vars: Record<string, string> = {};

    const activeType =
      map.ai_provider?.trim() ||
      providers[0]?.providerType ||
      process.env.AI_PROVIDER?.trim();
    if (activeType) vars.AI_PROVIDER = activeType;

    const openai = providers.find((p) => p.providerType === "openai" && p.apiKey);
    const gemini = providers.find((p) => p.providerType === "gemini" && p.apiKey);

    const openaiKey = openai?.apiKey?.trim() || map.openai_api_key?.trim();
    if (openaiKey && !openaiKey.includes("•")) {
      vars.OPENAI_API_KEY = openaiKey;
      vars.OPENAI_MODEL = openai?.model || map.openai_model?.trim() || "gpt-4o-mini";
    }

    const geminiKey = gemini?.apiKey?.trim() || map.google_ai_api_key?.trim();
    if (geminiKey && !geminiKey.includes("•")) {
      vars.GOOGLE_AI_API_KEY = geminiKey;
      vars.GEMINI_MODEL = gemini?.model || map.gemini_model?.trim() || "gemini-2.5-flash";
    }

    if (Object.keys(vars).length === 0) {
      return NextResponse.json({
        success: false,
        message: "No API keys to write — save providers or import from .env first.",
      });
    }

    const updated = await upsertEnvFileVars(vars);
    return NextResponse.json({
      success: true,
      updated,
      message: `Wrote ${updated.length} variable(s) to .env. Restart dev server to reload environment.`,
    });
  } catch (e) {
    logger.error("Sync AI settings to .env failed", { error: String(e) });
    return NextResponse.json({ error: "Could not update .env file" }, { status: 500 });
  }
}
