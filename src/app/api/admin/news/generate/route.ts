import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { generateLocalizedNewsArticle, newsLocaleSchema } from "@/lib/news";
import { logger } from "@/lib/logger";

const generateSchema = z.object({
  topic: z.string().trim().min(3).max(200),
  authorName: z.string().trim().min(1).max(100),
  locales: z.array(newsLocaleSchema).min(1).max(3).refine(
    (locales) => new Set(locales).size === locales.length,
    "Choose each language only once"
  ),
});

const GENERATE_COOLDOWN_MS = 3_000;
let lastGeneratedAt = 0;

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const { topic, authorName, locales } = generateSchema.parse(await request.json());
    const now = Date.now();
    if (now - lastGeneratedAt < GENERATE_COOLDOWN_MS) {
      return NextResponse.json({ error: "Too many requests, please wait" }, { status: 429 });
    }

    lastGeneratedAt = now;
    const article = await generateLocalizedNewsArticle(topic, locales);
    const item = await prisma.newsArticle.create({
      data: { ...article, authorName, source: "ai", status: "pending" },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: e.issues.map((issue) => issue.message).join(". ") },
        { status: 400 }
      );
    }
    const message = e instanceof Error ? e.message : "Article generation failed.";
    logger.error("Admin news generation failed", { message });
    const status = message.startsWith("No AI provider is configured") ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
