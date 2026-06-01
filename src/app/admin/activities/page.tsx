import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

export default async function AdminActivitiesPage() {
  const activities = await prisma.companyActivity.findMany({ orderBy: { order: "asc" } });

  return (
    <AdminPageShell
      title="Company Activities"
      description="Images and descriptions shown on the About page"
      actions={
        <Button asChild className="cursor-pointer">
          <Link href="/admin/activities/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Activity
          </Link>
        </Button>
      }
    >
      <div className="overflow-hidden rounded-xl border border-slate-100">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Images</th>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((a) => (
              <tr key={a.id} className="border-t">
                <td className="px-4 py-3 font-medium">{a.title}</td>
                <td className="px-4 py-3 text-slate-500">{a.images.length}</td>
                <td className="px-4 py-3">{a.order}</td>
                <td className="px-4 py-3">
                  <Badge variant={a.isVisible ? "default" : "secondary"}>
                    {a.isVisible ? "Visible" : "Hidden"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild variant="outline" size="sm" className="cursor-pointer">
                    <Link href={`/admin/activities/${a.id}`}>Edit</Link>
                  </Button>
                </td>
              </tr>
            ))}
            {activities.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No activities yet. Add your first company activity.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminPageShell>
  );
}
