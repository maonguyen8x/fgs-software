"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Building2, ExternalLink, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";
import { publishPublicSiteUpdate } from "@/lib/admin-public-sync";
import {
  ABOUT_BRANCH_HQ_ADDRESS_JA_KEY,
  ABOUT_BRANCH_HQ_ADDRESS_KEY,
  ABOUT_BRANCH_HQ_ADDRESS_VI_KEY,
} from "@/lib/about-branch-copy";

interface AboutBranchSettingsPanelProps {
  settings: Record<string, string>;
}

export function AboutBranchSettingsPanel({ settings: initial }: AboutBranchSettingsPanelProps) {
  const t = useTranslations("admin.settings.about_branch");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    addressEn: initial[ABOUT_BRANCH_HQ_ADDRESS_KEY] ?? "",
    addressVi: initial[ABOUT_BRANCH_HQ_ADDRESS_VI_KEY] ?? "",
    addressJa: initial[ABOUT_BRANCH_HQ_ADDRESS_JA_KEY] ?? "",
  });

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        [ABOUT_BRANCH_HQ_ADDRESS_KEY]: form.addressEn.trim(),
        [ABOUT_BRANCH_HQ_ADDRESS_VI_KEY]: form.addressVi.trim(),
        [ABOUT_BRANCH_HQ_ADDRESS_JA_KEY]: form.addressJa.trim(),
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <MapPin className="h-5 w-5 text-primary-600" />
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{t("subtitle")}</p>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0 cursor-pointer">
          <Link href="/admin/branches">
            <Building2 className="mr-2 h-4 w-4" />
            {t("manage_branches")}
            <ExternalLink className="ml-1 h-3.5 w-3.5 opacity-60" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        <div>
          <Label>{t("address_vi")}</Label>
          <Textarea
            className="mt-1 min-h-[72px]"
            value={form.addressVi}
            onChange={(e) => setForm((f) => ({ ...f, addressVi: e.target.value }))}
            placeholder={t("address_vi_placeholder")}
          />
        </div>
        <div>
          <Label>{t("address_en")}</Label>
          <Textarea
            className="mt-1 min-h-[72px]"
            value={form.addressEn}
            onChange={(e) => setForm((f) => ({ ...f, addressEn: e.target.value }))}
            placeholder={t("address_en_placeholder")}
          />
        </div>
        <div>
          <Label>{t("address_ja")}</Label>
          <Textarea
            className="mt-1 min-h-[72px]"
            value={form.addressJa}
            onChange={(e) => setForm((f) => ({ ...f, addressJa: e.target.value }))}
            placeholder={t("address_ja_placeholder")}
          />
        </div>
      </div>

      <p className="text-xs text-slate-500">{t("hint")}</p>

      <Button type="button" className="cursor-pointer" disabled={saving} onClick={() => void handleSave()}>
        {saving ? t("saving") : t("save")}
      </Button>
    </div>
  );
}
