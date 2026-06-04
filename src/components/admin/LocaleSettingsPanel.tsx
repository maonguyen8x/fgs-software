"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LocaleTabs } from "./LocaleTabs";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";
import { publishPublicSiteUpdate } from "@/lib/admin-public-sync";
import { SITE_DEFAULT_LOCALE_KEY } from "@/lib/site-default-locale-keys";
import type { Locale } from "@/i18n/routing";
import { Save, Globe } from "lucide-react";

const LOCALE_CODES = ["en", "ja", "vi"] as const;

interface LocaleSettingsPanelProps {
  settings: Record<string, string>;
}

export function LocaleSettingsPanel({ settings: initial }: LocaleSettingsPanelProps) {
  const t = useTranslations("admin.settings.locale_panel");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    site_default_locale: (initial[SITE_DEFAULT_LOCALE_KEY] ?? "en") as Locale,
    locale_enabled_en: initial.locale_enabled_en ?? "true",
    locale_enabled_ja: initial.locale_enabled_ja ?? "true",
    locale_enabled_vi: initial.locale_enabled_vi ?? "true",
    site_tagline: initial.site_tagline ?? initial.hero_subheadline ?? "",
    site_taglineJa: initial.site_tagline_ja ?? initial.hero_subheadline_ja ?? "",
    site_taglineVi: initial.site_tagline_vi ?? initial.hero_subheadline_vi ?? "",
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const localeMeta: Record<(typeof LOCALE_CODES)[number], { flag: string; label: string }> = {
    en: { flag: "🇺🇸", label: t("lang_en") },
    ja: { flag: "🇯🇵", label: t("lang_ja") },
    vi: { flag: "🇻🇳", label: t("lang_vi") },
  };

  const handleSave = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        [SITE_DEFAULT_LOCALE_KEY]: form.site_default_locale,
        locale_enabled_en: form.locale_enabled_en,
        locale_enabled_ja: form.locale_enabled_ja,
        locale_enabled_vi: form.locale_enabled_vi,
        site_tagline: form.site_tagline,
        site_tagline_ja: form.site_taglineJa,
        site_tagline_vi: form.site_taglineVi,
        hero_subheadline: form.site_tagline,
        hero_subheadline_ja: form.site_taglineJa,
        hero_subheadline_vi: form.site_taglineVi,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      showAdminErrorToast(t("save_failed"));
      return;
    }
    showAdminSuccessToast(t("save_success"));
    publishPublicSiteUpdate(router, { defaultLocale: form.site_default_locale });
  };

  const tabLabels = { en: t("lang_en"), ja: t("lang_ja"), vi: t("lang_vi") };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
          <Globe className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-primary-800">{t("title")}</h2>
          <p className="text-sm text-slate-500">{t("subtitle")}</p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-primary-100 bg-primary-50/40 p-4">
        <Label htmlFor="site_default_locale" className="text-sm font-semibold text-slate-800">
          {t("default_locale")}
        </Label>
        <p className="mt-1 text-xs text-slate-500">{t("default_locale_hint")}</p>
        <select
          id="site_default_locale"
          value={form.site_default_locale}
          onChange={(e) => update("site_default_locale", e.target.value)}
          className="mt-3 w-full max-w-xs cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
        >
          {LOCALE_CODES.map((code) => (
            <option key={code} value={code}>
              {localeMeta[code].flag} {localeMeta[code].label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {LOCALE_CODES.map((code) => {
          const loc = localeMeta[code];
          return (
            <div key={code} className="rounded-xl border border-slate-200/80 p-4">
              <p className="mb-3 text-sm font-semibold">
                {loc.flag} {loc.label}
              </p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form[`locale_enabled_${code}` as keyof typeof form] !== "false"}
                  onChange={(e) =>
                    update(`locale_enabled_${code}`, e.target.checked ? "true" : "false")
                  }
                />
                {t("visible_on_site")}
              </label>
              <p className="mt-3 text-xs text-slate-500">{t("crud_hint")}</p>
            </div>
          );
        })}
      </div>

      <LocaleTabs prefix="site_tagline" labels={tabLabels} values={form} onChange={update} multiline />

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleSave} disabled={loading} className="cursor-pointer gap-1">
          <Save className="h-4 w-4" />
          {loading ? t("saving") : t("save")}
        </Button>
        <Button asChild variant="outline" size="sm" className="cursor-pointer">
          <Link href="/admin/services">{t("manage_services")}</Link>
        </Button>
      </div>
    </div>
  );
}
