import dynamic from "next/dynamic";
import { getTranslations } from "next-intl/server";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminContentBlock } from "@/components/admin/AdminContentBlock";
import { AdminPanelSkeleton } from "@/components/admin/AdminPanelSkeleton";

const AiProvidersPanel = dynamic(
  () => import("@/components/admin/AiProvidersPanel").then((m) => m.AiProvidersPanel),
  { loading: () => <AdminPanelSkeleton /> }
);
const EmailSettingsPanel = dynamic(
  () => import("@/components/admin/EmailSettingsPanel").then((m) => m.EmailSettingsPanel),
  { loading: () => <AdminPanelSkeleton /> }
);

export default async function AdminSettingsIntegrationsPage() {
  const t = await getTranslations("admin.settings");

  return (
    <AdminPageShell
      title={t("pages.integrations_title")}
      description={t("pages.integrations_desc")}
      unboxed
    >
      <div className="space-y-6">
        <AdminContentBlock sectionId="settings-email">
          <EmailSettingsPanel />
        </AdminContentBlock>
        <AdminContentBlock sectionId="settings-ai-providers">
          <AiProvidersPanel />
        </AdminContentBlock>
      </div>
    </AdminPageShell>
  );
}
