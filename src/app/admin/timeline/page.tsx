import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

export default async function AdminTimelinePage() {
  const t = await getTranslations("admin.timeline");
  const items = await prisma.timelineMilestone.findMany({ orderBy: { order: "asc" } });

  return (
    <AdminPageShell
      title="Timeline"
      description="Company milestones on the About page"
      actions={
        <Button asChild className="cursor-pointer">
          <Link href="/admin/timeline/new">
            <Plus className="mr-2 h-4 w-4" />
            Add milestone
          </Link>
        </Button>
      }
    >
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">{t("title_section")}</th>
              <th className="px-4 py-3">{t("description_section")}</th>
              <th className="px-4 py-3">{t("order")}</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-100 align-top">
                <td className="px-4 py-3 font-mono text-slate-600">{item.milestoneDate}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{item.title}</p>
                  {item.titleVi ? <p className="text-xs text-slate-500">{item.titleVi}</p> : null}
                </td>
                <td className="max-w-xs px-4 py-3">
                  <p className="line-clamp-3 text-slate-600">{item.description || "—"}</p>
                </td>
                <td className="px-4 py-3">{item.order}</td>
                <td className="px-4 py-3">
                  <Badge variant={item.isVisible ? "default" : "secondary"}>
                    {item.isVisible ? "Visible" : "Hidden"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild variant="outline" size="sm" className="cursor-pointer">
                    <Link href={`/admin/timeline/${item.id}`}>Edit</Link>
                  </Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No milestones yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminPageShell>
  );
}
