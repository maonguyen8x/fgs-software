import { getTranslations } from "next-intl/server";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminSecuritySettingsPanel } from "@/components/admin/AdminSecuritySettingsPanel";

export default async function AdminSecuritySettingsPage() {
  const t = await getTranslations("admin.security");

  return (
    <AdminPageShell title={t("page_title")} description={t("page_desc")}>
      <AdminSecuritySettingsPanel />
    </AdminPageShell>
  );
}
