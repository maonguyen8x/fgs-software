import Link from "next/link";
import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import { getSettingsMap } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { LocaleSettingsPanel } from "@/components/admin/LocaleSettingsPanel";
import { ThemeSettingsPanel } from "@/components/admin/ThemeSettingsPanel";
import { HeaderNavSettingsPanel } from "@/components/admin/HeaderNavSettingsPanel";
import { LogoSettingsPanel } from "@/components/admin/LogoSettingsPanel";
import { HeroSlidesPanel } from "@/components/admin/HeroSlidesPanel";
import { ClientsSectionSettingsPanel } from "@/components/admin/ClientsSectionSettingsPanel";
import { TeamPageSettingsPanel } from "@/components/admin/TeamPageSettingsPanel";
import { AboutBranchSettingsPanel } from "@/components/admin/AboutBranchSettingsPanel";
import { AboutActivitiesSettingsPanel } from "@/components/admin/AboutActivitiesSettingsPanel";
import { SiteNoticeSettingsPanel } from "@/components/admin/SiteNoticeSettingsPanel";
import { AdminPanelSkeleton } from "@/components/admin/AdminPanelSkeleton";
import { AdminSettingsLocaleSwitcher } from "@/components/admin/AdminSettingsLocaleSwitcher";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminContentBlock } from "@/components/admin/AdminContentBlock";
import { AdminSettingsSectionNav } from "@/components/admin/AdminSettingsSectionNav";

const AiProvidersPanel = dynamic(
  () => import("@/components/admin/AiProvidersPanel").then((m) => m.AiProvidersPanel),
  { loading: () => <AdminPanelSkeleton /> }
);
const SettingsForm = dynamic(
  () => import("@/components/admin/SettingsForm").then((m) => m.SettingsForm),
  { loading: () => <AdminPanelSkeleton /> }
);

export default async function AdminSettingsPage() {
  const settings = await getSettingsMap();
  const t = await getTranslations("admin.settings");

  return (
    <AdminPageShell title={t("page.title")} description={t("page.description")} unboxed>
      <div className="mb-6 flex justify-end">
        <AdminSettingsLocaleSwitcher />
      </div>

      <div className="space-y-6">
        <AdminContentBlock sectionId="settings-logo">
          <LogoSettingsPanel settings={settings} />
        </AdminContentBlock>

        <AdminContentBlock sectionId="settings-hero-slides">
          <HeroSlidesPanel />
        </AdminContentBlock>

        <AdminContentBlock sectionId="settings-clients">
          <ClientsSectionSettingsPanel settings={settings} />
        </AdminContentBlock>

        <AdminContentBlock sectionId="settings-team-page">
          <TeamPageSettingsPanel settings={settings} />
        </AdminContentBlock>

        <AdminContentBlock sectionId="settings-about-branch">
          <AboutBranchSettingsPanel settings={settings} />
        </AdminContentBlock>

        <AdminContentBlock sectionId="settings-about-activities">
          <AboutActivitiesSettingsPanel />
        </AdminContentBlock>

        <AdminContentBlock sectionId="settings-site-notice">
          <SiteNoticeSettingsPanel settings={settings} />
        </AdminContentBlock>

        <AdminContentBlock sectionId="settings-header-nav">
          <HeaderNavSettingsPanel settings={settings} />
        </AdminContentBlock>

        <AdminContentBlock sectionId="settings-locale">
          <LocaleSettingsPanel settings={settings} />
        </AdminContentBlock>

        <AdminContentBlock sectionId="settings-theme">
          <ThemeSettingsPanel settings={settings} />
        </AdminContentBlock>

        <AdminContentBlock sectionId="settings-ai-providers">
          <AiProvidersPanel />
        </AdminContentBlock>

        <AdminContentBlock
          sectionId="settings-page-content"
          className="border-primary-100/80 bg-linear-to-br from-white to-primary-50/30"
        >
          <p className="text-sm leading-relaxed text-slate-700">{t("page_content_hint")}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild className="cursor-pointer" variant="outline">
              <Link href="/admin/pages">{t("page_content_link")}</Link>
            </Button>
            <Button asChild className="cursor-pointer" variant="outline">
              <Link href="/admin/timeline">{t("timeline_content_link")}</Link>
            </Button>
          </div>
        </AdminContentBlock>

        <AdminContentBlock padding="lg" sectionId="settings-general-form">
          <SettingsForm settings={settings} />
        </AdminContentBlock>
      </div>

      <AdminSettingsSectionNav />
    </AdminPageShell>
  );
}
