import { getSettingsMap } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LocaleSettingsPanel } from "@/components/admin/LocaleSettingsPanel";
import { ThemeSettingsPanel } from "@/components/admin/ThemeSettingsPanel";
import { AiProvidersPanel } from "@/components/admin/AiProvidersPanel";
import { AdminSettingsToolbar } from "@/components/admin/AdminSettingsToolbar";

export default async function AdminSettingsPage() {
  const settings = await getSettingsMap();
  return (
    <div className="p-8">
      <AdminSettingsToolbar />
      <AdminPageHeader
        title="Site Settings"
        description="Languages, theme, AI providers, company info, and map coordinates."
        backHref="/admin/dashboard"
      />
      <div className="space-y-10">
        <LocaleSettingsPanel settings={settings} />
        <ThemeSettingsPanel settings={settings} />
        <AiProvidersPanel />
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
