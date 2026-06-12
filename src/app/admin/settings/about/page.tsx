import { getTranslations } from "next-intl/server";
import { getSettingsMap } from "@/lib/settings";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminContentBlock } from "@/components/admin/AdminContentBlock";
import { AboutBranchSettingsPanel } from "@/components/admin/AboutBranchSettingsPanel";
import { AboutActivitiesSettingsPanel } from "@/components/admin/AboutActivitiesSettingsPanel";

export default async function AdminSettingsAboutPage() {
  const settings = await getSettingsMap();
  const t = await getTranslations("admin.settings");

  return (
    <AdminPageShell title={t("pages.about_title")} description={t("pages.about_desc")} unboxed>
      <div className="space-y-6">
        <AdminContentBlock sectionId="settings-about-branch">
          <AboutBranchSettingsPanel settings={settings} />
        </AdminContentBlock>
        <AdminContentBlock sectionId="settings-about-activities">
          <AboutActivitiesSettingsPanel />
        </AdminContentBlock>
      </div>
    </AdminPageShell>
  );
}
