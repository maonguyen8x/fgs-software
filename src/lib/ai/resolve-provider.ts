import { prisma } from "@/lib/db";
import { getAiRuntimeConfig } from "./config";
import { readEnvApiKey } from "./env-keys";
import { normalizeGeminiModel } from "@/lib/chat/providers/gemini";
import { isUsableApiKey } from "./api-key";

export interface ResolvedAiProvider {
  type: "openai" | "gemini" | "anthropic";
  apiKey: string;
  model: string;
  source: "database" | "environment";
}

const PROVIDER_TYPES: ResolvedAiProvider["type"][] = ["gemini", "openai", "anthropic"];

function envProvider(
  type: ResolvedAiProvider["type"],
  config: Awaited<ReturnType<typeof getAiRuntimeConfig>>
): ResolvedAiProvider | null {
  if (type === "openai") {
    const apiKey = isUsableApiKey(config.openaiApiKey) ? config.openaiApiKey : readEnvApiKey("openai");
    if (!apiKey) return null;
    return { type: "openai", apiKey, model: config.openaiModel, source: "environment" };
  }
  if (type === "gemini") {
    const apiKey = isUsableApiKey(config.googleAiApiKey) ? config.googleAiApiKey : readEnvApiKey("gemini");
    if (!apiKey) return null;
    return {
      type: "gemini",
      apiKey,
      model: normalizeGeminiModel(config.geminiModel),
      source: "environment",
    };
  }
  const apiKey = readEnvApiKey("anthropic");
  if (!apiKey) return null;
  return {
    type: "anthropic",
    apiKey,
    model: process.env.ANTHROPIC_MODEL?.trim() || "claude-3-5-haiku-20241022",
    source: "environment",
  };
}

function providerTypeOrder(preferred: string | undefined): ResolvedAiProvider["type"][] {
  const strict =
    preferred === "openai" || preferred === "gemini" || preferred === "anthropic";
  if (!strict) return [...PROVIDER_TYPES];
  return [preferred, ...PROVIDER_TYPES.filter((t) => t !== preferred)];
}

/** All configured providers: .env first, then database; preferred type ordered first. */
export async function resolveAiProviderCandidates(): Promise<ResolvedAiProvider[]> {
  const dbProviders = await prisma.aiProvider.findMany({
    where: { isEnabled: true },
    orderBy: { order: "asc" },
  });
  const config = await getAiRuntimeConfig();
  const typeOrder = providerTypeOrder(config.provider?.toLowerCase());
  const seen = new Set<string>();
  const candidates: ResolvedAiProvider[] = [];

  const add = (entry: ResolvedAiProvider | null) => {
    if (!entry) return;
    const key = `${entry.type}:${entry.source}`;
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push(entry);
  };

  const pickDb = (type: ResolvedAiProvider["type"]) => {
    const row = dbProviders.find((p) => p.providerType === type);
    if (!row || !isUsableApiKey(row.apiKey)) return null;
    return {
      type,
      apiKey: row.apiKey.trim(),
      model: type === "gemini" ? normalizeGeminiModel(row.model) : row.model,
      source: "database" as const,
    };
  };

  for (const type of typeOrder) {
    add(envProvider(type, config));
  }
  for (const type of typeOrder) {
    add(pickDb(type));
  }

  return candidates;
}

export async function resolveActiveAiProvider(): Promise<ResolvedAiProvider | null> {
  const candidates = await resolveAiProviderCandidates();
  return candidates[0] ?? null;
}
