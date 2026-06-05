import { getTranslations } from "next-intl/server";
import { PartnerForm } from "@/components/admin/PartnerForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function NewPartnerPage() {
  const t = await getTranslations("admin.partners");

  return (
    <div className="p-8">
      <AdminPageHeader title={t("new_title")} backHref="/admin/partners" showHome={false} />
      <PartnerForm />
    </div>
  );
}
