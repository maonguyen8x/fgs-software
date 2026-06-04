import type { Locale } from "@/i18n/routing";
import { logger } from "@/lib/logger";
import { buildCompanyKnowledge } from "./context";
import { buildSystemPrompt } from "./prompt";
import { generateGeminiReply } from "./providers/gemini";
import { generateOpenAIReply } from "./providers/openai";
import { generateAnthropicReply } from "./providers/anthropic";
import {
  resolveAiProviderCandidates,
  type ResolvedAiProvider,
} from "@/lib/ai/resolve-provider";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

interface GenerateReplyParams {
  locale: Locale;
  messages: ChatTurn[];
  assistantName: string;
}

export type AiProvider = "openai" | "gemini" | "anthropic";

export class AiChatUnavailableError extends Error {
  constructor(message = "AI providers unavailable") {
    super(message);
    this.name = "AiChatUnavailableError";
  }
}

async function callProvider(
  provider: ResolvedAiProvider,
  systemPrompt: string,
  messages: ChatTurn[]
): Promise<string> {
  if (provider.type === "openai") {
    return generateOpenAIReply(provider.apiKey, systemPrompt, messages, provider.model);
  }
  if (provider.type === "gemini") {
    return generateGeminiReply(provider.apiKey, systemPrompt, messages, provider.model);
  }
  return generateAnthropicReply(provider.apiKey, systemPrompt, messages, provider.model);
}

export async function generateChatReply({
  locale,
  messages,
  assistantName,
}: GenerateReplyParams): Promise<string> {
  const knowledge = await buildCompanyKnowledge(locale);
  const latestUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const systemPrompt = buildSystemPrompt(locale, knowledge, assistantName, latestUser, messages);

  const candidates = await resolveAiProviderCandidates();

  if (candidates.length === 0) {
    const { readEnvApiKey } = await import("@/lib/ai/env-keys");
    logger.error("No AI provider configured", {
      envOpenai: Boolean(readEnvApiKey("openai")),
      envGemini: Boolean(readEnvApiKey("gemini")),
      envAnthropic: Boolean(readEnvApiKey("anthropic")),
      hint: "Set OPENAI_API_KEY or GOOGLE_AI_API_KEY in .env, restart the dev server, then use Admin → Sync from .env if needed.",
    });
    throw new AiChatUnavailableError("No AI API key configured");
  }

  const errors: string[] = [];
  for (const provider of candidates) {
    try {
      logger.info("Chat using AI provider", {
        type: provider.type,
        model: provider.model,
        source: provider.source,
      });
      return await callProvider(provider, systemPrompt, messages);
    } catch (error) {
      const msg = String(error);
      errors.push(`${provider.type}: ${msg}`);
      logger.warn("AI provider failed, trying next", {
        error: msg,
        type: provider.type,
        model: provider.model,
      });
    }
  }

  logger.error("All AI providers failed", { errors });
  throw new AiChatUnavailableError(errors.join("; "));
}

export async function getActiveAiProvider(): Promise<AiProvider | null> {
  const candidates = await resolveAiProviderCandidates();
  return candidates[0]?.type ?? null;
}
