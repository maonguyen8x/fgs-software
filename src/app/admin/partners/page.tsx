import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

export default async function AdminPartnersPage() {
  const partners = await prisma.partner.findMany({ orderBy: { order: "asc" } });

  return (
    <AdminPageShell
      title="Clients & Partners"
      description="Manage logos and names shown on the homepage"
      actions={
        <Button asChild className="cursor-pointer">
          <Link href="/admin/partners/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Partner
          </Link>
        </Button>
      }
    >
      <div className="overflow-hidden rounded-xl border border-slate-100">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Website</th>
              <th className="px-4 py-3 text-left">Order</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-slate-500">{p.websiteUrl ?? "—"}</td>
                <td className="px-4 py-3">{p.order}</td>
                <td className="px-4 py-3">
                  <Badge variant={p.isVisible ? "default" : "secondary"}>
                    {p.isVisible ? "Visible" : "Hidden"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild variant="outline" size="sm" className="cursor-pointer">
                    <Link href={`/admin/partners/${p.id}`}>Edit</Link>
                  </Button>
                </td>
              </tr>
            ))}
            {partners.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No partners yet. Add your first client or partner.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminPageShell>
  );
}
