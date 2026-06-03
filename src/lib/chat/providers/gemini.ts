import { logger } from "@/lib/logger";
import type { ChatTurn } from "../ai";

/** Legacy model IDs mapped to current free-tier models (Google AI Studio, 2026). */
const GEMINI_MODEL_ALIASES: Record<string, string> = {
  "gemini-2.0-flash": "gemini-2.5-flash",
  "gemini-2.0-flash-001": "gemini-2.5-flash",
  "gemini-2.0-flash-lite": "gemini-2.5-flash-lite",
  "gemini-2.0-flash-lite-001": "gemini-2.5-flash-lite",
  "gemini-1.5-flash": "gemini-2.5-flash",
  "gemini-1.5-flash-8b": "gemini-2.5-flash-lite",
};

const GEMINI_FALLBACK_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-flash-latest",
] as const;

export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export function normalizeGeminiModel(model: string): string {
  const trimmed = model.trim();
  return GEMINI_MODEL_ALIASES[trimmed] ?? trimmed;
}

async function requestGemini(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: ChatTurn[]
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.45,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    logger.error("Gemini API error", { model, status: response.status, err: err.slice(0, 500) });
    let detail = `HTTP ${response.status}`;
    try {
      const parsed = JSON.parse(err) as { error?: { message?: string } };
      if (parsed.error?.message) detail = parsed.error.message.slice(0, 200);
    } catch {
      /* ignore */
    }
    throw new Error(`Gemini ${model}: ${detail}`);
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error(`Empty Gemini response (${model})`);
  return text;
}

export async function generateGeminiReply(
  apiKey: string,
  systemPrompt: string,
  messages: ChatTurn[],
  model = process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL
): Promise<string> {
  const primary = normalizeGeminiModel(model);
  const models = [
    primary,
    ...GEMINI_FALLBACK_MODELS.filter((m) => m !== primary),
  ];
  let lastError: Error | null = null;

  for (const candidate of models) {
    try {
      return await requestGemini(apiKey, candidate, systemPrompt, messages);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError ?? new Error("Gemini service unavailable");
}
