import { getTranslations } from "next-intl/server";
import { getSettingsMap } from "@/lib/settings";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminContentBlock } from "@/components/admin/AdminContentBlock";
import { AdminPanelSkeleton } from "@/components/admin/AdminPanelSkeleton";
import { LocaleSettingsPanel } from "@/components/admin/LocaleSettingsPanel";
import { ThemeSettingsPanel } from "@/components/admin/ThemeSettingsPanel";
import { HeaderNavSettingsPanel } from "@/components/admin/HeaderNavSettingsPanel";
import { LogoSettingsPanel } from "@/components/admin/LogoSettingsPanel";
import { SiteNoticeSettingsPanel } from "@/components/admin/SiteNoticeSettingsPanel";
import { AdminSettingsLocaleSwitcher } from "@/components/admin/AdminSettingsLocaleSwitcher";

export default async function AdminSettingsSitePage() {
  const settings = await getSettingsMap();
  const t = await getTranslations("admin.settings");

  return (
    <AdminPageShell title={t("pages.site_title")} description={t("pages.site_desc")} unboxed>
      <div className="mb-6 flex justify-end">
        <AdminSettingsLocaleSwitcher />
      </div>
      <div className="space-y-6">
        <AdminContentBlock sectionId="settings-logo">
          <LogoSettingsPanel settings={settings} />
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
        <AdminContentBlock sectionId="settings-site-notice">
          <SiteNoticeSettingsPanel settings={settings} />
        </AdminContentBlock>
      </div>
    </AdminPageShell>
  );
}
