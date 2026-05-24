"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocaleTabs } from "./LocaleTabs";
import { toast } from "sonner";
import { Save, Globe } from "lucide-react";

const LOCALES = [
  { code: "en", flag: "🇺🇸", label: "English" },
  { code: "ja", flag: "🇯🇵", label: "日本語" },
  { code: "vi", flag: "🇻🇳", label: "Tiếng Việt" },
] as const;

interface LocaleSettingsPanelProps {
  settings: Record<string, string>;
}

export function LocaleSettingsPanel({ settings: initial }: LocaleSettingsPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    locale_enabled_en: initial.locale_enabled_en ?? "true",
    locale_enabled_ja: initial.locale_enabled_ja ?? "true",
    locale_enabled_vi: initial.locale_enabled_vi ?? "true",
    site_tagline: initial.site_tagline ?? initial.hero_subheadline ?? "",
    site_taglineJa: initial.site_tagline_ja ?? initial.hero_subheadline_ja ?? "",
    site_taglineVi: initial.site_tagline_vi ?? initial.hero_subheadline_vi ?? "",
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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
      toast.error("Failed to save");
      return;
    }
    toast.success("Language settings saved");
    router.refresh();
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
          <Globe className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-primary-800">Multilingual (EN / JA / VI)</h2>
          <p className="text-sm text-slate-500">Enable locales and edit shared site taglines per language.</p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {LOCALES.map((loc) => (
          <div key={loc.code} className="rounded-xl border border-slate-200/80 p-4">
            <p className="mb-3 text-sm font-semibold">
              {loc.flag} {loc.label}
            </p>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form[`locale_enabled_${loc.code}` as keyof typeof form] !== "false"}
                onChange={(e) =>
                  update(`locale_enabled_${loc.code}`, e.target.checked ? "true" : "false")
                }
              />
              Visible on website
            </label>
            <p className="mt-3 text-xs text-slate-500">
              Content CRUD: use Team, Services, Works, Blog, About sections in the sidebar.
            </p>
          </div>
        ))}
      </div>

      <LocaleTabs
        prefix="site_tagline"
        labels={{ en: "English", ja: "日本語", vi: "Tiếng Việt" }}
        values={form}
        onChange={update}
        multiline
      />

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleSave} disabled={loading} className="cursor-pointer gap-1">
          <Save className="h-4 w-4" />
          Save languages
        </Button>
        <Button asChild variant="outline" size="sm" className="cursor-pointer">
          <Link href="/admin/services">Manage services translations</Link>
        </Button>
      </div>
    </div>
  );
}
