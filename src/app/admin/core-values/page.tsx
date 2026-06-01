import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

export default async function AdminCoreValuesPage() {
  const items = await prisma.coreValue.findMany({ orderBy: { order: "asc" } });

  return (
    <AdminPageShell
      title="Core Values"
      description="Displayed on the About page"
      actions={
        <Button asChild className="cursor-pointer">
          <Link href="/admin/core-values/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Value
          </Link>
        </Button>
      }
    >
      <div className="overflow-hidden rounded-xl border border-slate-100">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">Icon</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3 font-mono text-xs">{item.icon}</td>
                <td className="px-4 py-3 font-medium">{item.title}</td>
                <td className="px-4 py-3">
                  <Badge variant={item.isVisible ? "default" : "secondary"}>
                    {item.isVisible ? "Visible" : "Hidden"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild variant="outline" size="sm" className="cursor-pointer">
                    <Link href={`/admin/core-values/${item.id}`}>Edit</Link>
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
