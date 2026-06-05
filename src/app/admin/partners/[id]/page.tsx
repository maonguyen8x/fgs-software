import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { PartnerForm } from "@/components/admin/PartnerForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations("admin.partners");
  const partner = await prisma.partner.findUnique({ where: { id } });
  if (!partner) notFound();

  return (
    <div className="p-8">
      <AdminPageHeader title={t("edit_title")} backHref="/admin/partners" showHome={false} />
      <PartnerForm initial={partner} />
    </div>
  );
}
