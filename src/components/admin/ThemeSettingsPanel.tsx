"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Palette, Save } from "lucide-react";

interface ThemeSettingsPanelProps {
  settings: Record<string, string>;
}

const FONT_OPTIONS = [
  { value: "inter", label: "Inter (default)" },
  { value: "system", label: "System UI" },
  { value: "noto", label: "Noto Sans JP (Japanese-friendly)" },
];

export function ThemeSettingsPanel({ settings: initial }: ThemeSettingsPanelProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    theme_default: initial.theme_default ?? "light",
    font_family: initial.font_family ?? "inter",
    font_weight: initial.font_weight ?? "normal",
    theme_primary_color: initial.theme_primary_color ?? "#2563eb",
    theme_radius: initial.theme_radius ?? "1rem",
  });

  const handleSave = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error("Failed to save theme");
      return;
    }
    toast.success("Theme settings saved");
    router.refresh();
  };

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          <Palette className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Theme & Typography</h2>
          <p className="text-sm text-slate-500">Default mode, fonts, and primary brand color.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Default color mode</Label>
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={form.theme_default}
            onChange={(e) => setForm((f) => ({ ...f, theme_default: e.target.value }))}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div>
          <Label>Font family</Label>
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={form.font_family}
            onChange={(e) => setForm((f) => ({ ...f, font_family: e.target.value }))}
          >
            {FONT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Font weight style</Label>
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={form.font_weight}
            onChange={(e) => setForm((f) => ({ ...f, font_weight: e.target.value }))}
          >
            <option value="normal">Normal</option>
            <option value="medium">Medium</option>
            <option value="semibold">Semibold</option>
          </select>
        </div>
        <div>
          <Label>Primary color</Label>
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
          <Label>Border radius</Label>
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
        Save theme
      </Button>
    </div>
  );
}
