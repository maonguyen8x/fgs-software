import { z } from "zod";
import { prisma } from "@/lib/db";

export const NEWS_PAGE_SIZE_SETTING_KEY = "news_page_size";
export const NEWS_PAGE_SIZE_OPTIONS = [10, 15, 30] as const;
export const NEWS_DEFAULT_PAGE_SIZE = 10;
export const NEWS_STATUSES = ["pending", "active", "inactive"] as const;

export const newsStatusSchema = z.enum(NEWS_STATUSES);

export const newsInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  titleJa: z.string().trim().max(200).optional(),
  titleVi: z.string().trim().max(200).optional(),
  summary: z.string().trim().min(1).max(1000),
  summaryJa: z.string().trim().max(1000).optional(),
  summaryVi: z.string().trim().max(1000).optional(),
  content: z.string().trim().min(1).max(20000),
  contentJa: z.string().trim().max(20000).optional(),
  contentVi: z.string().trim().max(20000).optional(),
  imageUrl: z.string().trim().max(2000).optional(),
  authorName: z.string().trim().min(1).max(100),
  status: newsStatusSchema.default("pending"),
});

export const newsPageSizeSchema = z.object({
  pageSize: z.union([z.literal(10), z.literal(15), z.literal(30)]),
});

export async function getNewsPageSize(): Promise<number> {
  const row = await prisma.setting.findUnique({ where: { key: NEWS_PAGE_SIZE_SETTING_KEY } });
  const parsed = Number(row?.value);
  return (NEWS_PAGE_SIZE_OPTIONS as readonly number[]).includes(parsed) ? parsed : NEWS_DEFAULT_PAGE_SIZE;
}

const generatedArticleSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(1000),
  content: z.string().min(1).max(20000),
});

export type GeneratedArticle = z.infer<typeof generatedArticleSchema>;

const OLLAMA_TIMEOUT_MS = 120_000;

/** Calls a local Ollama server and returns a validated article, or throws. */
export async function generateArticleWithOllama(topic: string): Promise<GeneratedArticle> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";
  const model = process.env.OLLAMA_MODEL ?? "qwen2.5:3b";

  const prompt = [
    "You are a technology journalist for a Japanese-focused IT company.",
    `Write one short, factual news article about: ${topic}.`,
    "Do not invent company names, statistics, quotes or dates. If unsure, stay general.",
    "For legal or insurance topics give general information only, not legal advice, and say the reader should check official sources.",
    'Reply ONLY with JSON: {"title": string, "summary": string (max 2 sentences), "content": string (3 short paragraphs)}.',
  ].join("\n");

  const res = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false, format: "json" }),
    signal: AbortSignal.timeout(OLLAMA_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Ollama responded with ${res.status}`);

  const body = (await res.json()) as { response?: string };
  const parsed = generatedArticleSchema.safeParse(JSON.parse(body.response ?? "{}"));
  if (!parsed.success) throw new Error("Ollama output failed validation");
  return parsed.data;
}
