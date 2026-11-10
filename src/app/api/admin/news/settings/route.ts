import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { NEWS_PAGE_SIZE_SETTING_KEY, newsPageSizeSchema } from "@/lib/news";

export async function PUT(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;
  try {
    const { pageSize } = newsPageSizeSchema.parse(await request.json());
    await prisma.setting.upsert({
      where: { key: NEWS_PAGE_SIZE_SETTING_KEY },
      update: { value: String(pageSize) },
      create: { key: NEWS_PAGE_SIZE_SETTING_KEY, value: String(pageSize) },
    });
    return NextResponse.json({ pageSize });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
