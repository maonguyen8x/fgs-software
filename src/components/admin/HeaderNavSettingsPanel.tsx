"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";
import { Menu, Plus, Save, Trash2 } from "lucide-react";
import {
  DEFAULT_HEADER_NAV,
  HEADER_NAV_SETTING_KEY,
  type HeaderNavConfig,
  type HeaderNavItem,
  type HeaderNavSubItem,
  type HeaderTextTransform,
  parseHeaderNavConfig,
} from "@/lib/header-nav";

interface HeaderNavSettingsPanelProps {
  settings: Record<string, string>;
}

const TRANSFORMS: HeaderTextTransform[] = ["none", "uppercase", "lowercase", "capitalize"];

function newItem(): HeaderNavItem {
  return {
    id: `custom-${Date.now()}`,
    href: "/",
    labelEn: "New item",
    labelVi: "Mục mới",
    enabled: true,
  };
}

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

  const addItem = () => {
    setConfig((c) => ({ ...c, items: [...c.items, newItem()] }));
  };

  const removeItem = (index: number) => {
    setConfig((c) => ({ ...c, items: c.items.filter((_, i) => i !== index) }));
  };

  const addSubItem = (itemIndex: number) => {
    setConfig((c) => {
      const items = [...c.items];
      const children = [...(items[itemIndex].children ?? [])];
      children.push({
        id: `sub-${Date.now()}`,
        href: "/",
        labelEn: "Sub link",
        labelVi: "Liên kết phụ",
        enabled: true,
      });
      items[itemIndex] = { ...items[itemIndex], children };
      return { ...c, items };
    });
  };

  const updateSub = (itemIndex: number, subIndex: number, patch: Partial<HeaderNavSubItem>) => {
    setConfig((c) => {
      const items = [...c.items];
      const children = [...(items[itemIndex].children ?? [])];
      children[subIndex] = { ...children[subIndex], ...patch };
      items[itemIndex] = { ...items[itemIndex], children };
      return { ...c, items };
    });
  };

  const removeSub = (itemIndex: number, subIndex: number) => {
    setConfig((c) => {
      const items = [...c.items];
      const children = (items[itemIndex].children ?? []).filter((_, i) => i !== subIndex);
      items[itemIndex] = { ...items[itemIndex], children };
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
    router.refresh();
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
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={(e) => updateItem(index, { enabled: e.target.checked })}
                />
                {t("item_enabled")}
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="cursor-pointer text-red-600"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label>{t("href")}</Label>
                <Input className="mt-1 font-mono text-sm" value={item.href} onChange={(e) => updateItem(index, { href: e.target.value })} />
              </div>
              <div>
                <Label>{t("label_en")}</Label>
                <Input className="mt-1" value={item.labelEn} onChange={(e) => updateItem(index, { labelEn: e.target.value })} />
              </div>
              <div>
                <Label>{t("label_vi")}</Label>
                <Input className="mt-1" value={item.labelVi} onChange={(e) => updateItem(index, { labelVi: e.target.value })} />
              </div>
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

            <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={(item.children?.length ?? 0) > 0}
                  onChange={(e) => {
                    if (!e.target.checked) {
                      updateItem(index, { children: [] });
                    } else if ((item.children?.length ?? 0) === 0) {
                      addSubItem(index);
                    }
                  }}
                />
                {t("enable_submenu", { label: item.labelVi || item.labelEn })}
              </label>

              {(item.children?.length ?? 0) > 0 && (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-600">{t("submenu_links")}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => addSubItem(index)}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      {t("add_submenu")}
                    </Button>
                  </div>
                  {(item.children ?? []).map((sub, subIndex) => (
                    <div
                      key={sub.id}
                      className="rounded-lg border border-white/80 bg-white p-3 shadow-sm"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary-700">
                          {t("submenu_item")} {subIndex + 1}
                        </span>
                        <label className="flex items-center gap-1.5 text-xs">
                          <input
                            type="checkbox"
                            checked={sub.enabled}
                            onChange={(e) => updateSub(index, subIndex, { enabled: e.target.checked })}
                          />
                          {t("item_enabled")}
                        </label>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        <div>
                          <Label className="text-xs">{t("href")}</Label>
                          <Input
                            className="mt-0.5 font-mono text-sm"
                            value={sub.href}
                            onChange={(e) => updateSub(index, subIndex, { href: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">{t("label_en")}</Label>
                          <Input
                            className="mt-0.5"
                            value={sub.labelEn}
                            onChange={(e) => updateSub(index, subIndex, { labelEn: e.target.value })}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label className="text-xs">{t("label_vi")}</Label>
                          <Input
                            className="mt-0.5"
                            value={sub.labelVi}
                            onChange={(e) => updateSub(index, subIndex, { labelVi: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2 cursor-pointer text-red-600"
                        onClick={() => removeSub(index, subIndex)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        {t("delete")}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="outline" className="cursor-pointer" onClick={addItem}>
          <Plus className="mr-1 h-4 w-4" />
          {t("add_item")}
        </Button>
        <Button type="button" onClick={handleSave} disabled={loading} className="cursor-pointer gap-1">
          <Save className="h-4 w-4" />
          {loading ? t("saving") : t("save")}
        </Button>
      </div>
    </div>
  );
}
