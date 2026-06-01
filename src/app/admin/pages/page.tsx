import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PUBLIC_PAGES, type PublicPageId } from "@/lib/page-content";
import { cn } from "@/lib/utils";

const PAGE_LABELS: Record<PublicPageId, string> = {
  home: "Home",
  about: "About",
  services: "Services",
  works: "Portfolio",
  contact: "Contact",
};

export default async function AdminPagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const activePage = PUBLIC_PAGES.includes(pageParam as PublicPageId)
    ? (pageParam as PublicPageId)
    : "home";

  const blocks = await prisma.pageContentBlock.findMany({
    where: { page: activePage },
    orderBy: { order: "asc" },
  });

  return (
    <div className="p-8">
      <AdminPageHeader
        title="Page content"
        description="Manage titles, subtitles, and body copy for public pages (no hardcoded text)."
        backHref="/admin/settings"
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {PUBLIC_PAGES.map((p) => (
          <Link
            key={p}
            href={`/admin/pages?page=${p}`}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm font-semibold transition-colors",
              activePage === p
                ? "border-primary-600 bg-primary-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-primary-300"
            )}
          >
            {PAGE_LABELS[p]}
          </Link>
        ))}
      </div>

      <div className="mb-4 flex justify-end">
        <Button asChild className="cursor-pointer">
          <Link href={`/admin/pages/${activePage}/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add block
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">Key</th>
              <th className="px-4 py-3 text-left">Title (EN)</th>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="px-4 py-3 font-mono text-xs">{b.key}</td>
                <td className="px-4 py-3">{b.title ?? "—"}</td>
                <td className="px-4 py-3">{b.order}</td>
                <td className="px-4 py-3">
                  <Badge variant={b.isVisible ? "default" : "secondary"}>
                    {b.isVisible ? "Visible" : "Hidden"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild variant="outline" size="sm" className="cursor-pointer">
                    <Link href={`/admin/pages/${activePage}/${b.id}`}>Edit</Link>
                  </Button>
                </td>
              </tr>
            ))}
            {blocks.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No blocks for this page. Add one or run database seed.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
