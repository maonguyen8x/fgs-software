import { prisma } from "@/lib/db";
import { getAiRuntimeConfig } from "./config";

export interface ResolvedAiProvider {
  type: "openai" | "gemini" | "anthropic";
  apiKey: string;
  model: string;
}

export async function resolveActiveAiProvider(): Promise<ResolvedAiProvider | null> {
  const dbProviders = await prisma.aiProvider.findMany({
    where: { isEnabled: true },
    orderBy: { order: "asc" },
  });

  const preferred = (await getAiRuntimeConfig()).provider;

  const pick = (type: string) =>
    dbProviders.find((p) => p.providerType === type && p.apiKey?.trim());

  if (preferred === "openai") {
    const p = pick("openai");
    if (p?.apiKey) return { type: "openai", apiKey: p.apiKey, model: p.model };
  }
  if (preferred === "gemini") {
    const p = pick("gemini");
    if (p?.apiKey) return { type: "gemini", apiKey: p.apiKey, model: p.model };
  }
  if (preferred === "anthropic") {
    const p = pick("anthropic");
    if (p?.apiKey) return { type: "anthropic", apiKey: p.apiKey, model: p.model };
  }

  for (const type of ["openai", "gemini", "anthropic"] as const) {
    const p = pick(type);
    if (p?.apiKey) return { type, apiKey: p.apiKey, model: p.model };
  }

  const config = await getAiRuntimeConfig();
  if (config.openaiApiKey) {
    return { type: "openai", apiKey: config.openaiApiKey, model: config.openaiModel };
  }
  if (config.googleAiApiKey) {
    return { type: "gemini", apiKey: config.googleAiApiKey, model: config.geminiModel };
  }
  const anthropicEnv = process.env.ANTHROPIC_API_KEY?.trim();
  if (anthropicEnv) {
    return {
      type: "anthropic",
      apiKey: anthropicEnv,
      model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-20241022",
    };
  }

  return null;
}
