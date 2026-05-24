import { logger } from "@/lib/logger";
import type { ChatTurn } from "../ai";

export async function generateAnthropicReply(
  apiKey: string,
  systemPrompt: string,
  messages: ChatTurn[],
  model = process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-20241022"
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 700,
      temperature: 0.35,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    logger.error("Anthropic API error", { err });
    throw new Error("Anthropic service unavailable");
  }

  const data = (await response.json()) as {
    content?: { type: string; text?: string }[];
  };

  const text = data.content?.find((c) => c.type === "text")?.text?.trim();
  if (!text) throw new Error("Empty Anthropic response");
  return text;
}
