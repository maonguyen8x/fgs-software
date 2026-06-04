"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Megaphone, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BlueCheckbox } from "@/components/ui/BlueCheckbox";
import { BlueRadioGroup } from "@/components/ui/BlueRadio";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";
import { publishPublicSiteUpdate } from "@/lib/admin-public-sync";

interface SiteNoticeSettingsPanelProps {
  settings: Record<string, string>;
}

export function SiteNoticeSettingsPanel({ settings: initial }: SiteNoticeSettingsPanelProps) {
  const t = useTranslations("admin.settings.site_notice");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    enabled: initial.site_notice_enabled === "true",
    maintenance: initial.site_maintenance_mode === "true",
    variant: initial.site_notice_variant ?? "info",
    titleVi: initial.site_notice_title_vi ?? "",
    titleEn: initial.site_notice_title_en ?? "",
    messageVi: initial.site_notice_message_vi ?? "",
    messageEn: initial.site_notice_message_en ?? "",
  });

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        site_notice_enabled: form.enabled ? "true" : "false",
        site_maintenance_mode: form.maintenance ? "true" : "false",
        site_notice_variant: form.variant,
        site_notice_title_vi: form.titleVi,
        site_notice_title_en: form.titleEn,
        site_notice_message_vi: form.messageVi,
        site_notice_message_en: form.messageEn,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      showAdminErrorToast(t("save_failed"));
      return;
    }
    showAdminSuccessToast(t("save_success"));
    publishPublicSiteUpdate(router);
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white">
          <Megaphone className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t("title")}</h2>
          <p className="text-sm text-slate-500">{t("subtitle")}</p>
        </div>
      </div>

      <div className="mb-4 space-y-3">
        <BlueCheckbox
          id="notice-enabled"
          checked={form.enabled}
          onChange={(checked) => setForm((f) => ({ ...f, enabled: checked }))}
          label={t("enabled")}
        />
        <BlueCheckbox
          id="maintenance-mode"
          checked={form.maintenance}
          onChange={(checked) => setForm((f) => ({ ...f, maintenance: checked, variant: checked ? "maintenance" : f.variant }))}
          label={t("maintenance")}
        />
      </div>

      <BlueRadioGroup
        name="notice-variant"
        value={form.variant}
        className="mb-4"
        options={[
          { value: "info", label: t("variant_info") },
          { value: "warning", label: t("variant_warning") },
          { value: "maintenance", label: t("variant_maintenance") },
        ]}
        onChange={(value) => setForm((f) => ({ ...f, variant: value }))}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>{t("title_vi")}</Label>
          <Input className="mt-1" value={form.titleVi} onChange={(e) => setForm((f) => ({ ...f, titleVi: e.target.value }))} />
        </div>
        <div>
          <Label>{t("title_en")}</Label>
          <Input className="mt-1" value={form.titleEn} onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))} />
        </div>
        <div>
          <Label>{t("message_vi")}</Label>
          <Textarea className="mt-1" rows={3} value={form.messageVi} onChange={(e) => setForm((f) => ({ ...f, messageVi: e.target.value }))} />
        </div>
        <div>
          <Label>{t("message_en")}</Label>
          <Textarea className="mt-1" rows={3} value={form.messageEn} onChange={(e) => setForm((f) => ({ ...f, messageEn: e.target.value }))} />
        </div>
      </div>

      <Button type="button" className="mt-6 cursor-pointer gap-1" disabled={saving} onClick={() => void handleSave()}>
        <Save className="h-4 w-4" />
        {saving ? t("saving") : t("save")}
      </Button>
    </div>
  );
}
