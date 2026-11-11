import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import {
  NEWS_PAGE_SIZE_SETTING_KEY,
  NEWS_RSS_FEEDS_SETTING_KEY,
  newsPageSizeSchema,
  newsRssFeedsSchema,
} from "@/lib/news";

const settingsSchema = newsPageSizeSchema
  .partial()
  .extend({ rssFeeds: newsRssFeedsSchema.optional() })
  .refine((settings) => settings.pageSize !== undefined || settings.rssFeeds !== undefined);

export async function PUT(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;
  try {
    const settings = settingsSchema.parse(await request.json());
    const updates = [];
    if (settings.pageSize !== undefined) {
      updates.push(
        prisma.setting.upsert({
          where: { key: NEWS_PAGE_SIZE_SETTING_KEY },
          update: { value: String(settings.pageSize) },
          create: { key: NEWS_PAGE_SIZE_SETTING_KEY, value: String(settings.pageSize) },
        })
      );
    }
    if (settings.rssFeeds !== undefined) {
      updates.push(
        prisma.setting.upsert({
          where: { key: NEWS_RSS_FEEDS_SETTING_KEY },
          update: { value: JSON.stringify(settings.rssFeeds) },
          create: { key: NEWS_RSS_FEEDS_SETTING_KEY, value: JSON.stringify(settings.rssFeeds) },
        })
      );
    }
    await Promise.all(updates);
    return NextResponse.json(settings);
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors }, { status: 400 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
