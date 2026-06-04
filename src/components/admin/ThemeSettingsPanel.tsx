"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";
import { publishPublicSiteUpdate } from "@/lib/admin-public-sync";
import { Palette, Save } from "lucide-react";
import { applyBrandThemeToDocument, buildBrandThemeCss } from "@/lib/theme/brand-theme";

interface ThemeSettingsPanelProps {
  settings: Record<string, string>;
}

export function ThemeSettingsPanel({ settings: initial }: ThemeSettingsPanelProps) {
  const t = useTranslations("admin.settings.theme");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    theme_default: initial.theme_default ?? "light",
    font_family: initial.font_family ?? "inter",
    font_weight: initial.font_weight ?? "normal",
    theme_primary_color: initial.theme_primary_color ?? "#2563eb",
    theme_radius: initial.theme_radius ?? "1rem",
  });

  const fontOptions = [
    { value: "inter", label: t("font_inter") },
    { value: "system", label: t("font_system") },
    { value: "noto", label: t("font_noto") },
  ];

  const handleSave = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      showAdminErrorToast(t("save_failed"));
      return;
    }
    applyBrandThemeToDocument(form.theme_primary_color, form.theme_radius);
    const styleEl = document.getElementById("brand-theme-vars");
    if (styleEl) {
      styleEl.textContent = buildBrandThemeCss(form.theme_primary_color, form.theme_radius);
    }
    showAdminSuccessToast(t("save_success"));
    publishPublicSiteUpdate(router);
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          <Palette className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t("title")}</h2>
          <p className="text-sm text-slate-500">{t("subtitle")}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>{t("default_mode")}</Label>
          <AdminSelect
            value={form.theme_default}
            onChange={(e) => setForm((f) => ({ ...f, theme_default: e.target.value }))}
          >
            <option value="light">{t("mode_light")}</option>
            <option value="dark">{t("mode_dark")}</option>
          </AdminSelect>
        </div>
        <div>
          <Label>{t("font_family")}</Label>
          <AdminSelect
            value={form.font_family}
            onChange={(e) => setForm((f) => ({ ...f, font_family: e.target.value }))}
          >
            {fontOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </AdminSelect>
        </div>
        <div>
          <Label>{t("font_weight")}</Label>
          <AdminSelect
            value={form.font_weight}
            onChange={(e) => setForm((f) => ({ ...f, font_weight: e.target.value }))}
          >
            <option value="normal">{t("weight_normal")}</option>
            <option value="medium">{t("weight_medium")}</option>
            <option value="semibold">{t("weight_semibold")}</option>
          </AdminSelect>
        </div>
        <div>
          <Label>{t("primary_color")}</Label>
          <div className="mt-1 flex gap-2">
            <Input
              type="color"
              className="h-10 w-14 cursor-pointer p-1"
              value={form.theme_primary_color}
              onChange={(e) => setForm((f) => ({ ...f, theme_primary_color: e.target.value }))}
            />
            <Input
              value={form.theme_primary_color}
              onChange={(e) => setForm((f) => ({ ...f, theme_primary_color: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <Label>{t("border_radius")}</Label>
          <Input
            className="mt-1"
            value={form.theme_radius}
            onChange={(e) => setForm((f) => ({ ...f, theme_radius: e.target.value }))}
            placeholder="1rem"
          />
        </div>
      </div>

      <Button type="button" onClick={handleSave} disabled={loading} className="mt-6 cursor-pointer gap-1">
        <Save className="h-4 w-4" />
        {loading ? t("saving") : t("save")}
      </Button>
    </div>
  );
}
