import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import { getSettingsMap } from "@/lib/settings";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminContentBlock } from "@/components/admin/AdminContentBlock";
import { AdminPanelSkeleton } from "@/components/admin/AdminPanelSkeleton";
import { ClientsSectionSettingsPanel } from "@/components/admin/ClientsSectionSettingsPanel";
import { TeamPageSettingsPanel } from "@/components/admin/TeamPageSettingsPanel";

const HeroSlidesPanel = dynamic(
  () => import("@/components/admin/HeroSlidesPanel").then((m) => m.HeroSlidesPanel),
  { loading: () => <AdminPanelSkeleton /> }
);

export default async function AdminSettingsHomepagePage() {
  const settings = await getSettingsMap();
  const t = await getTranslations("admin.settings");

  return (
    <AdminPageShell title={t("pages.homepage_title")} description={t("pages.homepage_desc")} unboxed>
      <div className="space-y-6">
        <AdminContentBlock sectionId="settings-hero-slides">
          <HeroSlidesPanel />
        </AdminContentBlock>
        <AdminContentBlock sectionId="settings-clients">
          <ClientsSectionSettingsPanel settings={settings} />
        </AdminContentBlock>
        <AdminContentBlock sectionId="settings-team-page">
          <TeamPageSettingsPanel settings={settings} />
        </AdminContentBlock>
      </div>
    </AdminPageShell>
  );
}
