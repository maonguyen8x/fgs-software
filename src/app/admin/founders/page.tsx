import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export default async function AdminFoundersPage() {
  const founders = await prisma.founder.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Founding Team</h1>
          <p className="text-sm text-slate-500">Manage founders shown on the About page</p>
        </div>
        <Button asChild className="cursor-pointer">
          <Link href="/admin/founders/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Founder
          </Link>
        </Button>
      </div>
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {founders.map((f) => (
              <tr key={f.id} className="border-t">
                <td className="px-4 py-3 font-medium">{f.name}</td>
                <td className="px-4 py-3">{f.role}</td>
                <td className="px-4 py-3">
                  <Badge variant={f.isVisible ? "default" : "secondary"}>
                    {f.isVisible ? "Visible" : "Hidden"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild variant="outline" size="sm" className="cursor-pointer">
                    <Link href={`/admin/founders/${f.id}`}>Edit</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
