import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import { getSettingsMap } from "@/lib/settings";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminContentBlock } from "@/components/admin/AdminContentBlock";
import { AdminPanelSkeleton } from "@/components/admin/AdminPanelSkeleton";
import { ClientsSectionSettingsPanel } from "@/components/admin/ClientsSectionSettingsPanel";
import { TeamPageSettingsPanel } from "@/components/admin/TeamPageSettingsPanel";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
        <AdminContentBlock sectionId="settings-homepage-copy">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50/60 p-5">
            <div>
              <h2 className="font-semibold text-slate-900">Homepage text</h2>
              <p className="mt-1 text-sm text-slate-600">Add, edit, hide, or remove homepage copy in English, Japanese, and Vietnamese.</p>
            </div>
            <Button asChild variant="outline" className="cursor-pointer border-blue-200 bg-white text-blue-700 hover:bg-blue-100">
              <Link href="/admin/pages?page=home">Manage homepage text</Link>
            </Button>
          </div>
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
      </div>
    </AdminPageShell>
  );
}
