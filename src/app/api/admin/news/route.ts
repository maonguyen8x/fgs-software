import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { newsInputSchema } from "@/lib/news";

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;
  const items = await prisma.newsArticle.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;
  try {
    const data = newsInputSchema.parse(await request.json());
    const item = await prisma.newsArticle.create({ data: { ...data, source: "manual" } });
    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
