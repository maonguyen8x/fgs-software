import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

export default async function AdminWorksPage() {
  const works = await prisma.work.findMany({ orderBy: { order: "asc" } });

  return (
    <AdminPageShell
      title="Portfolio Works"
      actions={
        <Button asChild>
          <Link href="/admin/works/new">Add Work</Link>
        </Button>
      }
    >
      <div className="overflow-hidden rounded-xl border border-slate-100">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {works.map((w) => (
              <tr key={w.id} className="border-t">
                <td className="px-4 py-3">{w.title}</td>
                <td className="px-4 py-3">{w.category}</td>
                <td className="px-4 py-3">
                  <Badge variant={w.isVisible ? "default" : "secondary"}>
                    {w.isVisible ? "Visible" : "Hidden"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/works/${w.id}`}>Edit</Link>
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
