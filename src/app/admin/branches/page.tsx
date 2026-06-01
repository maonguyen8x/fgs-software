import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

export default async function AdminBranchesPage() {
  const branches = await prisma.companyBranch.findMany({ orderBy: { order: "asc" } });

  return (
    <AdminPageShell
      title="Branches"
      description="Office locations shown on the About page map"
      actions={
        <Button asChild className="cursor-pointer">
          <Link href="/admin/branches/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Branch
          </Link>
        </Button>
      }
    >
      <div className="overflow-hidden rounded-xl border border-slate-100">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">City</th>
              <th className="px-4 py-3 text-left">HQ</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="px-4 py-3 font-medium">{b.name}</td>
                <td className="px-4 py-3">{b.city}</td>
                <td className="px-4 py-3">
                  {b.isHeadquarters && <Badge>HQ</Badge>}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild variant="outline" size="sm" className="cursor-pointer">
                    <Link href={`/admin/branches/${b.id}`}>Edit</Link>
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
