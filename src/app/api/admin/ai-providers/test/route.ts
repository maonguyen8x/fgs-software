import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { resolveActiveAiProvider } from "@/lib/ai/resolve-provider";
import { readEnvApiKey } from "@/lib/ai/env-keys";
import { generateOpenAIReply } from "@/lib/chat/providers/openai";
import { generateGeminiReply } from "@/lib/chat/providers/gemini";
import { logger } from "@/lib/logger";

const TEST_PROMPT = "Reply with exactly: OK";

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  const active = await resolveActiveAiProvider();
  const envStatus = {
    openai: Boolean(readEnvApiKey("openai")),
    gemini: Boolean(readEnvApiKey("gemini")),
    anthropic: Boolean(readEnvApiKey("anthropic")),
  };

  if (!active) {
    return NextResponse.json({
      ok: false,
      mode: "none",
      message: "No AI API key active. Add OPENAI_API_KEY or GOOGLE_AI_API_KEY in .env, then use Import from .env in Settings.",
      envStatus,
    });
  }

  try {
    const reply =
      active.type === "gemini"
        ? await generateGeminiReply(active.apiKey, "You are a test assistant.", [{ role: "user", content: TEST_PROMPT }], active.model)
        : await generateOpenAIReply(active.apiKey, "You are a test assistant.", [{ role: "user", content: TEST_PROMPT }], active.model);

    return NextResponse.json({
      ok: true,
      mode: active.type,
      model: active.model,
      source: active.source,
      sampleReply: reply.slice(0, 120),
      envStatus,
      geminiSupported: true,
    });
  } catch (e) {
    logger.error("AI provider test failed", { error: String(e), type: active.type });
    return NextResponse.json({
      ok: false,
      mode: active.type,
      model: active.model,
      message: String(e),
      envStatus,
    }, { status: 502 });
  }
}
