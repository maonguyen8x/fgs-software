import { getTranslations } from "next-intl/server";
import { getSettingsMap } from "@/lib/settings";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminContentBlock } from "@/components/admin/AdminContentBlock";
import { AboutBranchSettingsPanel } from "@/components/admin/AboutBranchSettingsPanel";
import { AboutActivitiesSettingsPanel } from "@/components/admin/AboutActivitiesSettingsPanel";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminSettingsAboutPage() {
  const settings = await getSettingsMap();
  const t = await getTranslations("admin.settings");

  return (
    <AdminPageShell title={t("pages.about_title")} description={t("pages.about_desc")} unboxed>
      <div className="space-y-6">
        <AdminContentBlock sectionId="settings-about-copy">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blue-100 bg-blue-50/60 p-5">
            <div>
              <h2 className="font-semibold text-slate-900">Company page text</h2>
              <p className="mt-1 text-sm text-slate-600">Manage the company introduction copy in English, Japanese, and Vietnamese.</p>
            </div>
            <Button asChild variant="outline" className="cursor-pointer border-blue-200 bg-white text-blue-700 hover:bg-blue-100">
              <Link href="/admin/pages?page=about">Manage company page text</Link>
            </Button>
          </div>
        </AdminContentBlock>
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
