"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ImageIcon, Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";
import { publishPublicSiteUpdate } from "@/lib/admin-public-sync";
import { TEAM_PAGE_HERO_IMAGE_KEY } from "@/lib/team-page-settings";

interface TeamPageSettingsPanelProps {
  settings: Record<string, string>;
}

export function TeamPageSettingsPanel({ settings: initial }: TeamPageSettingsPanelProps) {
  const t = useTranslations("admin.settings.team_page");
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [heroImage, setHeroImage] = useState(initial[TEAM_PAGE_HERO_IMAGE_KEY] ?? "");

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        [TEAM_PAGE_HERO_IMAGE_KEY]: heroImage.trim(),
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
            <ImageIcon className="h-5 w-5 text-primary-600" />
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{t("subtitle")}</p>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0 cursor-pointer">
          <Link href="/admin/team?tab=founders">
            <Users className="mr-2 h-4 w-4" />
            {t("manage_leaders")}
            <ExternalLink className="ml-1 h-3.5 w-3.5 opacity-60" />
          </Link>
        </Button>
      </div>

      <ImageUploadField
        label={t("hero_image")}
        hint={t("hero_hint")}
        value={heroImage}
        onChange={setHeroImage}
      />

      <Button type="button" className="cursor-pointer" disabled={saving} onClick={() => void handleSave()}>
        {saving ? t("saving") : t("save")}
      </Button>
    </div>
  );
}
