import { prisma } from "@/lib/db";
import { getNewsPageSize } from "@/lib/news";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { NewsAdminPanel } from "@/components/admin/NewsAdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const [items, pageSize] = await Promise.all([
    prisma.newsArticle.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    getNewsPageSize(),
  ]);

  return (
    <AdminPageShell title="News">
      <NewsAdminPanel
        pageSize={pageSize}
        items={items.map((item) => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          content: item.content,
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
