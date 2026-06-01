import { logger } from "@/lib/logger";
import type { ChatTurn } from "../ai";

export async function generateOpenAIReply(
  apiKey: string,
  systemPrompt: string,
  messages: ChatTurn[],
  model = process.env.OPENAI_MODEL ?? "gpt-4o-mini"
): Promise<string> {

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      max_tokens: 700,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    logger.error("OpenAI API error", { status: response.status, err: err.slice(0, 500) });
    let detail = `HTTP ${response.status}`;
    try {
      const parsed = JSON.parse(err) as { error?: { message?: string; code?: string } };
      if (parsed.error?.message) detail = parsed.error.message;
    } catch {
      /* ignore */
    }
    throw new Error(`OpenAI: ${detail}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty OpenAI response");
  return content;
}
