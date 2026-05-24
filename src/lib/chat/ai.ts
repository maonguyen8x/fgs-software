import type { Locale } from "@/i18n/routing";
import { logger } from "@/lib/logger";
import { buildCompanyKnowledge } from "./context";
import { buildSystemPrompt } from "./prompt";
import { generateFallbackReply } from "./providers/fallback";
import { generateGeminiReply } from "./providers/gemini";
import { generateOpenAIReply } from "./providers/openai";
import { generateAnthropicReply } from "./providers/anthropic";
import { resolveActiveAiProvider } from "@/lib/ai/resolve-provider";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

interface GenerateReplyParams {
  locale: Locale;
  messages: ChatTurn[];
  assistantName: string;
}

export type AiProvider = "openai" | "gemini" | "anthropic" | "fallback";

export async function generateChatReply({
  locale,
  messages,
  assistantName,
}: GenerateReplyParams): Promise<string> {
  const knowledge = await buildCompanyKnowledge(locale);
  const latestUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const systemPrompt = buildSystemPrompt(locale, knowledge, assistantName, latestUser);

  const active = await resolveActiveAiProvider();

  if (active) {
    try {
      if (active.type === "openai") {
        return await generateOpenAIReply(active.apiKey, systemPrompt, messages, active.model);
      }
      if (active.type === "gemini") {
        return await generateGeminiReply(active.apiKey, systemPrompt, messages, active.model);
      }
      return await generateAnthropicReply(active.apiKey, systemPrompt, messages, active.model);
    } catch (error) {
      logger.warn("AI provider failed, using fallback", { error: String(error), type: active.type });
    }
  }

  return generateFallbackReply(locale, messages, knowledge, assistantName);
}

export async function getActiveAiProvider(): Promise<AiProvider> {
  const active = await resolveActiveAiProvider();
  return active?.type ?? "fallback";
}
