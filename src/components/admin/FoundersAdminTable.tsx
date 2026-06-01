import Link from "next/link";
import type { Founder } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

interface FoundersAdminTableProps {
  founders: Founder[];
  addLabel: string;
  editLabel: string;
  visibleLabel: string;
  hiddenLabel: string;
  nameCol: string;
  roleCol: string;
  statusCol: string;
  actionsCol: string;
}

export function FoundersAdminTable({
  founders,
  addLabel,
  editLabel,
  visibleLabel,
  hiddenLabel,
  nameCol,
  roleCol,
  statusCol,
  actionsCol,
}: FoundersAdminTableProps) {
  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button asChild className="cursor-pointer">
          <Link href="/admin/founders/new">
            <Plus className="mr-2 h-4 w-4" />
            {addLabel}
          </Link>
        </Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-theme bg-surface shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted">
            <tr>
              <th className="px-4 py-3 text-left">{nameCol}</th>
              <th className="px-4 py-3 text-left">{roleCol}</th>
              <th className="px-4 py-3 text-left">{statusCol}</th>
              <th className="px-4 py-3 text-right">{actionsCol}</th>
            </tr>
          </thead>
          <tbody>
            {founders.map((f) => (
              <tr key={f.id} className="border-t border-theme">
                <td className="px-4 py-3 font-medium">{f.name}</td>
                <td className="px-4 py-3">{f.role}</td>
                <td className="px-4 py-3">
                  <Badge variant={f.isVisible ? "default" : "secondary"}>
                    {f.isVisible ? visibleLabel : hiddenLabel}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild variant="outline" size="sm" className="cursor-pointer">
                    <Link href={`/admin/founders/${f.id}`}>{editLabel}</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
