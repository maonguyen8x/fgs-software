import { z } from "zod";
import { prisma } from "@/lib/db";
import { resolveAiProviderCandidates, type ResolvedAiProvider } from "@/lib/ai/resolve-provider";
import type { ChatTurn } from "@/lib/chat/ai";
import { generateAnthropicReply } from "@/lib/chat/providers/anthropic";
import { generateGeminiReply } from "@/lib/chat/providers/gemini";
import { generateOpenAIReply } from "@/lib/chat/providers/openai";
import { logger } from "@/lib/logger";

export const NEWS_PAGE_SIZE_SETTING_KEY = "news_page_size";
export const NEWS_RSS_FEEDS_SETTING_KEY = "news_rss_feeds";
export const NEWS_PAGE_SIZE_OPTIONS = [10, 15, 30] as const;
export const NEWS_DEFAULT_PAGE_SIZE = 10;
export const NEWS_STATUSES = ["pending", "active", "inactive"] as const;

export const newsStatusSchema = z.enum(NEWS_STATUSES);
export const newsRssFeedsSchema = z
  .array(
    z
      .string()
      .trim()
      .url()
      .max(2048)
      .refine((value) => {
        try {
          const url = new URL(value);
          return url.protocol === "https:" && !url.username && !url.password && !url.port;
        } catch {
          return false;
        }
      }, "RSS feed URLs must use HTTPS and cannot include credentials or custom ports.")
  )
  .max(10)
  .refine((feeds) => new Set(feeds).size === feeds.length, "RSS feed URLs must be unique.");

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

export async function getNewsRssFeeds(): Promise<string[]> {
  const row = await prisma.setting.findUnique({ where: { key: NEWS_RSS_FEEDS_SETTING_KEY } });
  if (!row) return [];
  let value: unknown;
  try {
    value = JSON.parse(row.value);
  } catch {
    throw new Error("Stored RSS feed settings contain invalid JSON.");
  }
  return newsRssFeedsSchema.parse(value);
}

const generatedArticleSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(1000),
  content: z.string().min(1).max(20000),
});

export type GeneratedArticle = z.infer<typeof generatedArticleSchema>;

export const NEWS_LOCALES = ["en", "ja", "vi"] as const;
export const newsLocaleSchema = z.enum(NEWS_LOCALES);
type NewsLocale = (typeof NEWS_LOCALES)[number];
type GeneratedLocalizedArticle = GeneratedArticle &
  Partial<
    Record<
      "titleJa" | "titleVi" | "summaryJa" | "summaryVi" | "contentJa" | "contentVi",
      string
    >
  >;

async function callAiProvider(
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

const LOCALE_NAMES: Record<(typeof NEWS_LOCALES)[number], string> = {
  en: "English",
  ja: "Japanese",
  vi: "Vietnamese",
};

function getOllamaBaseUrl(): string | null {
  const configuredUrl = process.env.OLLAMA_BASE_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/+$/, "");
  return process.env.NODE_ENV === "production" ? null : "http://127.0.0.1:11434";
}

async function generateArticleWithOllama(
  baseUrl: string,
  topic: string,
  locale: (typeof NEWS_LOCALES)[number]
): Promise<GeneratedArticle> {
  const language = LOCALE_NAMES[locale];
  const prompt = [
    "You are a careful technology journalist for an IT company serving Japan and Vietnam.",
    `Write one concise, factual article in ${language} about: ${topic}.`,
    "Do not invent company names, statistics, quotes, sources, or dates. Avoid unsupported current claims.",
    "For legal or insurance topics provide general information only, not legal advice, and advise readers to verify official sources.",
    `Return only JSON with title, summary (at most two sentences), and content (three short paragraphs). Write all fields in ${language}.`,
  ].join("\n");
  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL ?? "qwen2.5:3b",
      prompt,
      stream: false,
      format: "json",
    }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) throw new Error(`Ollama responded with ${response.status}`);
  const body = (await response.json()) as { response?: string };
  const json = body.response?.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error("Ollama returned an invalid response.");
  return generatedArticleSchema.parse(JSON.parse(json));
}

function parseGeneratedArticle(response: string): GeneratedArticle {
 const json = response.match(/\{[\s\S]*\}/)?.[0];
 if (!json) throw new Error("The AI provider returned an invalid response.");
 return generatedArticleSchema.parse(JSON.parse(json));
}

async function generateArticleForLocale(
 topic: string,
 locale: NewsLocale,
 candidates: ResolvedAiProvider[],
 ollamaBaseUrl: string | null
): Promise<GeneratedArticle> {
 const language = LOCALE_NAMES[locale];
 const systemPrompt = [
   "You are a careful technology journalist for an IT company serving Japan and Vietnam.",
   `Write one concise, factual article in ${language} about the topic supplied by the user.`,
   "Do not invent company names, statistics, quotes, sources, or dates. Avoid unsupported current claims.",
   "For legal or insurance topics provide general information only, not legal advice, and advise readers to verify official sources.",
   `Write naturally for native ${language} readers and do not mix languages.`,
   `Return only valid JSON with title, summary (at most two sentences), and content (three short paragraphs). Write all fields in ${language}.`,
 ].join("\n");
 const messages: ChatTurn[] = [{ role: "user", content: `Topic: ${topic}` }];

 for (const provider of candidates) {
   try {
     const response = await callAiProvider(provider, systemPrompt, messages);
     return parseGeneratedArticle(response);
   } catch (error) {
     const message = error instanceof Error ? error.message : String(error);
     logger.warn("News generation provider failed", {
       provider: provider.type,
       model: provider.model,
       locale,
       message,
     });
   }
 }

 if (ollamaBaseUrl) {
   try {
     return await generateArticleWithOllama(ollamaBaseUrl, topic, locale);
   } catch (error) {
     const message = error instanceof Error ? error.message : String(error);
     logger.warn("Local Ollama news generation failed", { locale, message });
   }
 }

 throw new Error(`Could not generate the ${language} version of this article.`);
}

export async function generateLocalizedNewsArticle(
 topic: string,
 locales: NewsLocale[]
): Promise<GeneratedLocalizedArticle> {
 const candidates = await resolveAiProviderCandidates();
 const ollamaBaseUrl = getOllamaBaseUrl();
 if (candidates.length === 0 && !ollamaBaseUrl) {
   throw new Error("No AI provider is configured. Add an API key in Admin → Settings → AI providers.");
 }

 const articles: Partial<Record<NewsLocale, GeneratedArticle>> = {};
 try {
   for (const locale of locales) {
     articles[locale] = await generateArticleForLocale(
       topic,
       locale,
       candidates,
       ollamaBaseUrl
     );
   }
 } catch (error) {
   logger.error("News article generation failed", {
     message: error instanceof Error ? error.message : String(error),
     locales,
   });
   throw new Error("Article generation failed. Check the AI provider settings and try again.");
 }

 const primary = articles.en ?? articles[locales[0]];
 if (!primary) throw new Error("The AI provider returned no article.");
 return {
   ...primary,
   ...(articles.ja && {
     titleJa: articles.ja.title,
     summaryJa: articles.ja.summary,
     contentJa: articles.ja.content,
   }),
   ...(articles.vi && {
     titleVi: articles.vi.title,
     summaryVi: articles.vi.summary,
     contentVi: articles.vi.content,
   }),
 };
}
