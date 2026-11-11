import { prisma } from "@/lib/db";
import { getNewsPageSize, getNewsRssFeeds } from "@/lib/news";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { NewsAdminPanel } from "@/components/admin/NewsAdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const [items, pageSize, rssFeeds] = await Promise.all([
    prisma.newsArticle.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    getNewsPageSize(),
    getNewsRssFeeds(),
  ]);

  return (
    <AdminPageShell title="News">
      <NewsAdminPanel
        pageSize={pageSize}
        rssFeeds={rssFeeds}
        items={items.map((item) => ({
          id: item.id,
          title: item.title,
          titleJa: item.titleJa,
          titleVi: item.titleVi,
          summary: item.summary,
          summaryJa: item.summaryJa,
          summaryVi: item.summaryVi,
          content: item.content,
          contentJa: item.contentJa,
          contentVi: item.contentVi,
          imageUrl: item.imageUrl,
          authorName: item.authorName,
          source: item.source,
          status: item.status,
          createdAt: item.createdAt.toISOString(),
        }))}
      />
    </AdminPageShell>
  );
}
