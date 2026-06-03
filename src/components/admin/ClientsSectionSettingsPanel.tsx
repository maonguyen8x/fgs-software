"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Building2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";

import {
  HOME_CLIENTS_SUBTITLE_KEY,
  HOME_CLIENTS_SUBTITLE_JA_KEY,
  HOME_CLIENTS_SUBTITLE_VI_KEY,
  HOME_CLIENTS_TITLE_KEY,
  HOME_CLIENTS_TITLE_JA_KEY,
  HOME_CLIENTS_TITLE_VI_KEY,
} from "@/lib/home-clients-copy";

interface ClientsSectionSettingsPanelProps {
  settings: Record<string, string>;
}

export function ClientsSectionSettingsPanel({ settings: initial }: ClientsSectionSettingsPanelProps) {
  const t = useTranslations("admin.settings.clients_section");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    titleEn: initial[HOME_CLIENTS_TITLE_KEY] ?? "",
    titleVi: initial[HOME_CLIENTS_TITLE_VI_KEY] ?? "",
    titleJa: initial[HOME_CLIENTS_TITLE_JA_KEY] ?? "",
    subtitleEn: initial[HOME_CLIENTS_SUBTITLE_KEY] ?? "",
    subtitleVi: initial[HOME_CLIENTS_SUBTITLE_VI_KEY] ?? "",
    subtitleJa: initial[HOME_CLIENTS_SUBTITLE_JA_KEY] ?? "",
  });

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        [HOME_CLIENTS_TITLE_KEY]: form.titleEn,
        [HOME_CLIENTS_TITLE_VI_KEY]: form.titleVi,
        [HOME_CLIENTS_TITLE_JA_KEY]: form.titleJa,
        [HOME_CLIENTS_SUBTITLE_KEY]: form.subtitleEn,
        [HOME_CLIENTS_SUBTITLE_VI_KEY]: form.subtitleVi,
        [HOME_CLIENTS_SUBTITLE_JA_KEY]: form.subtitleJa,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      showAdminErrorToast(t("save_failed"));
      return;
    }
    showAdminSuccessToast(t("save_success"));
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t("title")}</h2>
          <p className="mt-1 text-sm text-slate-600">{t("subtitle")}</p>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0 cursor-pointer">
          <Link href="/admin/partners">
            <Building2 className="mr-2 h-4 w-4" />
            {t("manage_list")}
            <ExternalLink className="ml-1 h-3.5 w-3.5 opacity-60" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>{t("title_en")}</Label>
          <Input className="mt-1" value={form.titleEn} onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))} />
        </div>
        <div>
          <Label>{t("title_vi")}</Label>
          <Input className="mt-1" value={form.titleVi} onChange={(e) => setForm((f) => ({ ...f, titleVi: e.target.value }))} />
        </div>
        <div>
          <Label>{t("title_ja")}</Label>
          <Input className="mt-1" value={form.titleJa} onChange={(e) => setForm((f) => ({ ...f, titleJa: e.target.value }))} />
        </div>
        <div className="md:col-span-2">
          <Label>{t("subtitle_vi")}</Label>
          <Input className="mt-1" value={form.subtitleVi} onChange={(e) => setForm((f) => ({ ...f, subtitleVi: e.target.value }))} />
        </div>
        <div>
          <Label>{t("subtitle_en")}</Label>
          <Input className="mt-1" value={form.subtitleEn} onChange={(e) => setForm((f) => ({ ...f, subtitleEn: e.target.value }))} />
        </div>
        <div>
          <Label>{t("subtitle_ja")}</Label>
          <Input className="mt-1" value={form.subtitleJa} onChange={(e) => setForm((f) => ({ ...f, subtitleJa: e.target.value }))} />
        </div>
      </div>

      <p className="text-xs text-slate-500">{t("hint_logos")}</p>

      <Button type="button" className="cursor-pointer" disabled={saving} onClick={() => void handleSave()}>
        {saving ? t("saving") : t("save")}
      </Button>
    </div>
  );
}
