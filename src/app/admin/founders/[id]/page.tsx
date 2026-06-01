import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { FounderForm } from "@/components/admin/FounderForm";
import { Button } from "@/components/ui/button";

export default async function EditFounderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const founder = await prisma.founder.findUnique({ where: { id } });
  if (!founder) notFound();
  const t = await getTranslations("admin.team");

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-3">
        <Button asChild variant="outline" size="sm" className="cursor-pointer">
          <Link href="/admin/team?tab=founders">← {t("back")}</Link>
        </Button>
        <h1 className="text-2xl font-bold text-heading">{t("edit_founder")}</h1>
      </div>
      <FounderForm initial={founder} />
    </div>
  );
}
