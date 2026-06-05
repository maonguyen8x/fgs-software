import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { PartnersTable } from "@/components/admin/PartnersTable";

export default async function AdminPartnersPage() {
  const t = await getTranslations("admin.partners");
  const partners = await prisma.partner.findMany({ orderBy: { order: "asc" } });

  return (
    <AdminPageShell
      title={t("title")}
      description={t("subtitle")}
      actions={
        <Button asChild className="cursor-pointer">
          <Link href="/admin/partners/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("add")}
          </Link>
        </Button>
      }
    >
      <p className="mb-4 text-sm text-slate-600">{t("hint_public")}</p>
      <PartnersTable partners={partners} />
    </AdminPageShell>
  );
}
