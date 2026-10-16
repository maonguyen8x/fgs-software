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
import { Menu, Save } from "lucide-react";
import {
  DEFAULT_HEADER_NAV,
  HEADER_NAV_SETTING_KEY,
  type HeaderNavConfig,
  type HeaderNavItem,
  type HeaderTextTransform,
  parseHeaderNavConfig,
} from "@/lib/header-nav";

interface HeaderNavSettingsPanelProps {
  settings: Record<string, string>;
}

const TRANSFORMS: HeaderTextTransform[] = ["none", "uppercase", "lowercase", "capitalize"];

export function HeaderNavSettingsPanel({ settings: initial }: HeaderNavSettingsPanelProps) {
  const t = useTranslations("admin.settings.header_nav");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<HeaderNavConfig>(() =>
    parseHeaderNavConfig(initial[HEADER_NAV_SETTING_KEY])
  );

  const updateGlobal = (patch: Partial<HeaderNavConfig["global"]>) => {
    setConfig((c) => ({ ...c, global: { ...c.global, ...patch } }));
  };

  const updateItem = (index: number, patch: Partial<HeaderNavItem>) => {
    setConfig((c) => {
      const items = [...c.items];
      items[index] = { ...items[index], ...patch };
      return { ...c, items };
    });
  };

  const handleSave = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [HEADER_NAV_SETTING_KEY]: JSON.stringify(config) }),
    });
    setLoading(false);
    if (!res.ok) {
      showAdminErrorToast(t("save_failed"));
      return;
    }
    showAdminSuccessToast(t("save_success"));
    publishPublicSiteUpdate(router);
  };

  const resetDefaults = () => {
    setConfig(DEFAULT_HEADER_NAV);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <Menu className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{t("title")}</h2>
            <p className="text-sm text-slate-500">{t("subtitle")}</p>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" className="cursor-pointer" onClick={resetDefaults}>
          {t("reset_defaults")}
        </Button>
      </div>

      <div className="mb-8 grid gap-4 rounded-lg border border-slate-100 bg-slate-50/80 p-4 md:grid-cols-3">
        <div>
          <Label>{t("global_font_size")}</Label>
          <Input
            type="number"
            min={12}
            max={24}
            className="mt-1"
            value={config.global.fontSizePx ?? 17}
            onChange={(e) => updateGlobal({ fontSizePx: parseInt(e.target.value, 10) || 17 })}
          />
        </div>
        <div>
          <Label>{t("global_font_weight")}</Label>
          <AdminSelect
            value={config.global.fontWeight ?? "600"}
            onChange={(e) => updateGlobal({ fontWeight: e.target.value })}
          >
            <option value="500">500</option>
            <option value="600">600</option>
            <option value="700">700</option>
          </AdminSelect>
        </div>
        <div>
          <Label>{t("global_text_transform")}</Label>
          <AdminSelect
            value={config.global.textTransform ?? "none"}
            onChange={(e) => updateGlobal({ textTransform: e.target.value as HeaderTextTransform })}
          >
            {TRANSFORMS.map((tr) => (
              <option key={tr} value={tr}>
                {t(`transform_${tr}`)}
              </option>
            ))}
          </AdminSelect>
        </div>
        <div>
          <Label>{t("global_color")}</Label>
          <Input
            type="color"
            className="mt-1 h-10 w-full cursor-pointer"
            value={config.global.color || "#334155"}
            onChange={(e) => updateGlobal({ color: e.target.value })}
          />
        </div>
        <div>
          <Label>{t("global_active_color")}</Label>
          <Input
            type="color"
            className="mt-1 h-10 w-full cursor-pointer"
            value={config.global.activeColor || "#2563eb"}
            onChange={(e) => updateGlobal({ activeColor: e.target.value })}
          />
        </div>
        <div>
          <Label>{t("global_font_style")}</Label>
          <AdminSelect
            value={config.global.fontStyle ?? "normal"}
            onChange={(e) => updateGlobal({ fontStyle: e.target.value as "normal" | "italic" })}
          >
            <option value="normal">{t("style_normal")}</option>
            <option value="italic">{t("style_italic")}</option>
          </AdminSelect>
        </div>
      </div>

      <div className="space-y-4">
        {config.items.map((item, index) => (
          <div key={item.id} className="rounded-xl border border-slate-200 p-4">
            <div className="mb-3">
              <p className="text-sm font-semibold text-slate-800">
                {item.labelEn} <span className="font-normal text-slate-500">· {item.href}</span>
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label>{t("item_font_size")}</Label>
                <Input
                  type="number"
                  className="mt-1"
                  placeholder={String(config.global.fontSizePx ?? 17)}
                  value={item.fontSizePx ?? ""}
                  onChange={(e) =>
                    updateItem(index, { fontSizePx: e.target.value ? parseInt(e.target.value, 10) : undefined })
                  }
                />
              </div>
              <div>
                <Label>{t("item_text_transform")}</Label>
                <AdminSelect
                  value={item.textTransform ?? ""}
                  onChange={(e) =>
                    updateItem(index, {
                      textTransform: (e.target.value || undefined) as HeaderTextTransform | undefined,
                    })
                  }
                >
                  <option value="">{t("use_global")}</option>
                  {TRANSFORMS.map((tr) => (
                    <option key={tr} value={tr}>
                      {t(`transform_${tr}`)}
                    </option>
                  ))}
                </AdminSelect>
              </div>
              <div>
                <Label>{t("item_color")}</Label>
                <Input
                  type="color"
                  className="mt-1 h-10 w-full"
                  value={item.color || config.global.color || "#334155"}
                  onChange={(e) => updateItem(index, { color: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" onClick={handleSave} disabled={loading} className="cursor-pointer gap-1">
          <Save className="h-4 w-4" />
          {loading ? t("saving") : t("save")}
        </Button>
      </div>
    </div>
  );
}
