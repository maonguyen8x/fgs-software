import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

export default async function AdminTimelinePage() {
  const items = await prisma.timelineMilestone.findMany({ orderBy: { order: "asc" } });

  return (
    <AdminPageShell
      title="Company Timeline"
      description="Milestones shown on the About page (format: YYYY-MM)"
      actions={
        <Button asChild className="cursor-pointer">
          <Link href="/admin/timeline/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Milestone
          </Link>
        </Button>
      }
    >
      <div className="overflow-hidden rounded-xl border border-slate-100">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3 font-mono text-primary-600">{item.milestoneDate}</td>
                <td className="px-4 py-3">{item.title}</td>
                <td className="px-4 py-3 text-right">
                  <Button asChild variant="outline" size="sm" className="cursor-pointer">
                    <Link href={`/admin/timeline/${item.id}`}>Edit</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPageShell>
  );
}
