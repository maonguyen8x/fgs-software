import Link from "next/link";
import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import { getSettingsMap } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminContentBlock } from "@/components/admin/AdminContentBlock";
import { AdminPanelSkeleton } from "@/components/admin/AdminPanelSkeleton";

const SettingsForm = dynamic(
  () => import("@/components/admin/SettingsForm").then((m) => m.SettingsForm),
  { loading: () => <AdminPanelSkeleton /> }
);

export default async function AdminSettingsCompanyPage() {
  const settings = await getSettingsMap();
  const t = await getTranslations("admin.settings");

  return (
    <AdminPageShell title={t("pages.company_title")} description={t("pages.company_desc")} unboxed>
      <div className="space-y-6">
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
    </AdminPageShell>
  );
}
