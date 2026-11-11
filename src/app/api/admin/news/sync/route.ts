import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession } from "@/lib/admin-auth";
import { getNewsRssFeeds } from "@/lib/news";
import { fetchRssFeed } from "@/lib/news-rss";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const feeds = await getNewsRssFeeds();
    if (feeds.length === 0) {
      return NextResponse.json({ error: "Add at least one RSS feed URL before syncing." }, { status: 400 });
    }

    const results = await Promise.all(
      feeds.map(async (feedUrl) => {
        try {
          return await fetchRssFeed(feedUrl);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          logger.warn("RSS news import feed failed", { feedUrl, message });
          return { feedUrl, articles: [], rejectedMissingImage: 0, error: message };
        }
      })
    );
    const articles = results.flatMap((result) => result.articles);
    const sources = [...new Set(articles.map((article) => article.source))];
    const existing = sources.length
      ? await prisma.newsArticle.findMany({
          where: { source: { in: sources } },
          select: { source: true },
        })
      : [];
    const knownSources = new Set(existing.map((article) => article.source));
    const additions = articles.filter((article) => {
      if (knownSources.has(article.source)) return false;
      knownSources.add(article.source);
      return true;
    });

    if (additions.length > 0) {
      await prisma.newsArticle.createMany({
        data: additions.map((article) => ({
          ...article,
          status: "pending",
          source: article.source,
        })),
      });
    }

    const failedFeeds = results.flatMap((result) =>
      "error" in result ? [{ feedUrl: result.feedUrl, error: result.error }] : []
    );
    const rejectedMissingImage = results.reduce((total, result) => total + result.rejectedMissingImage, 0);

    if (articles.length === 0 && failedFeeds.length === feeds.length) {
      return NextResponse.json(
        { error: "All RSS feeds failed. Check the feed URLs and try again.", failedFeeds },
        { status: 502 }
      );
    }

    return NextResponse.json({
      imported: additions.length,
      duplicates: articles.length - additions.length,
      rejectedMissingImage,
      failedFeeds,
    });
  } catch (error) {
    logger.error("Admin RSS news import failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: "RSS import failed. Check the saved feed settings and try again." }, { status: 500 });
  }
}
