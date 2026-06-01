import Link from "next/link";
import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import { getSettingsMap } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { LocaleSettingsPanel } from "@/components/admin/LocaleSettingsPanel";
import { ThemeSettingsPanel } from "@/components/admin/ThemeSettingsPanel";
import { HeaderNavSettingsPanel } from "@/components/admin/HeaderNavSettingsPanel";
import { LogoSettingsPanel } from "@/components/admin/LogoSettingsPanel";
import { SiteNoticeSettingsPanel } from "@/components/admin/SiteNoticeSettingsPanel";
import { AdminPanelSkeleton } from "@/components/admin/AdminPanelSkeleton";
import { AdminSettingsLocaleSwitcher } from "@/components/admin/AdminSettingsLocaleSwitcher";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminContentBlock } from "@/components/admin/AdminContentBlock";

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
        <AdminContentBlock>
          <LogoSettingsPanel settings={settings} />
        </AdminContentBlock>

        <AdminContentBlock>
          <SiteNoticeSettingsPanel settings={settings} />
        </AdminContentBlock>

        <AdminContentBlock>
          <HeaderNavSettingsPanel settings={settings} />
        </AdminContentBlock>

        <AdminContentBlock>
          <LocaleSettingsPanel settings={settings} />
        </AdminContentBlock>

        <AdminContentBlock>
          <ThemeSettingsPanel settings={settings} />
        </AdminContentBlock>

        <AdminContentBlock>
          <AiProvidersPanel />
        </AdminContentBlock>

        <AdminContentBlock className="border-primary-100/80 bg-linear-to-br from-white to-primary-50/30">
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

        <AdminContentBlock padding="lg">
          <SettingsForm settings={settings} />
        </AdminContentBlock>
      </div>
    </AdminPageShell>
  );
}
