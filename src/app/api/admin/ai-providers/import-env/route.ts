import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";

const ENV_PROVIDERS = [
  {
    providerType: "openai",
    displayName: "OpenAI",
    envKey: "OPENAI_API_KEY",
    modelEnv: "OPENAI_MODEL",
    defaultModel: "gpt-4o-mini",
  },
  {
    providerType: "gemini",
    displayName: "Google Gemini",
    envKey: "GOOGLE_AI_API_KEY",
    modelEnv: "GEMINI_MODEL",
    defaultModel: "gemini-2.5-flash",
  },
  {
    providerType: "anthropic",
    displayName: "Anthropic Claude",
    envKey: "ANTHROPIC_API_KEY",
    modelEnv: "ANTHROPIC_MODEL",
    defaultModel: "claude-3-5-haiku-20241022",
  },
] as const;

export async function POST() {
  const { error } = await requireAdminSession();
  if (error) return error;

  let imported = 0;
  for (const [index, spec] of ENV_PROVIDERS.entries()) {
    const { readEnvApiKey } = await import("@/lib/ai/env-keys");
    const apiKey =
      spec.providerType === "openai"
        ? readEnvApiKey("openai")
        : spec.providerType === "gemini"
          ? readEnvApiKey("gemini")
          : readEnvApiKey("anthropic");
    if (!apiKey) continue;

    const model = process.env[spec.modelEnv]?.trim() || spec.defaultModel;
    const existing = await prisma.aiProvider.findFirst({
      where: { providerType: spec.providerType },
    });

    if (existing) {
      await prisma.aiProvider.update({
        where: { id: existing.id },
        data: { apiKey, model, displayName: spec.displayName, isEnabled: true },
      });
    } else {
      await prisma.aiProvider.create({
        data: {
          providerType: spec.providerType,
          displayName: spec.displayName,
          apiKey,
          model,
          isEnabled: true,
          order: index,
        },
      });
    }
    imported++;
  }

  return NextResponse.json({
    success: true,
    imported,
    message:
      imported > 0
        ? `Synced ${imported} provider(s) from server .env`
        : "No AI keys found in .env (OPENAI_API_KEY, GOOGLE_AI_API_KEY, ANTHROPIC_API_KEY)",
  });
}
