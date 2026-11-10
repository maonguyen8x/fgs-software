import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { generateArticleWithOllama } from "@/lib/news";

const generateSchema = z.object({
  topic: z.string().trim().min(3).max(200),
  authorName: z.string().trim().min(1).max(100),
});

const GENERATE_COOLDOWN_MS = 3_000;
let lastGeneratedAt = 0;

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const now = Date.now();
  if (now - lastGeneratedAt < GENERATE_COOLDOWN_MS) {
    return NextResponse.json({ error: "Too many requests, please wait" }, { status: 429 });
  }

  try {
    const { topic, authorName } = generateSchema.parse(await request.json());
    lastGeneratedAt = now;
    const article = await generateArticleWithOllama(topic);
    const item = await prisma.newsArticle.create({
      data: { ...article, authorName, source: "ollama", status: "pending" },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Generation failed" }, { status: 502 });
  }
}
