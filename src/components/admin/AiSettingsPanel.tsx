"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SecretInput } from "@/components/ui/secret-input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download, RefreshCw, Save, Sparkles, Trash2 } from "lucide-react";
import { AI_SETTING_KEYS } from "@/lib/ai/setting-keys";

interface AiSettingsPanelProps {
  initial: Record<string, string>;
}

const LABELS: Record<string, string> = {
  ai_provider: "AI Provider (auto | openai | gemini)",
  openai_api_key: "OpenAI API Key",
  openai_model: "OpenAI Model",
  google_ai_api_key: "Google AI (Gemini) API Key",
  gemini_model: "Gemini Model",
};

export function AiSettingsPanel({ initial }: AiSettingsPanelProps) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(() => {
    const base: Record<string, string> = {};
    for (const key of AI_SETTING_KEYS) {
      base[key] = initial[key] ?? "";
    }
    return base;
  });
  const [masks, setMasks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const loadPreview = useCallback(async () => {
    setPreviewLoading(true);
    try {
      const res = await fetch("/api/admin/settings/env-preview");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const next: Record<string, string> = {};
      for (const key of AI_SETTING_KEYS) {
        next[key] = data.fromEnv?.[key]?.masked ?? "";
      }
      setMasks(next);
      toast.success("Environment preview loaded (masked)");
    } catch {
      toast.error("Failed to load .env preview");
    } finally {
      setPreviewLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  const handleSave = async () => {
    setLoading(true);
    const payload: Record<string, string> = {};
    for (const key of AI_SETTING_KEYS) {
      const val = values[key]?.trim() ?? "";
      if (val && !val.includes("•")) {
        payload[key] = val;
      }
    }

    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error("Failed to save AI settings");
      return;
    }
    toast.success("AI settings saved");
    router.refresh();
  };

  const handleImportEnv = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/import-env", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message ?? "Imported from .env");
      router.refresh();
      const settingsRes = await fetch("/api/admin/settings");
      const all = await settingsRes.json();
      const next: Record<string, string> = {};
      for (const key of AI_SETTING_KEYS) {
        next[key] = all[key] ?? "";
      }
      setValues(next);
      await loadPreview();
    } catch {
      toast.error("Import failed — check server .env and try again");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm("Clear all AI API keys from database? Server .env keys will still work as fallback.")) return;
    setLoading(true);
    const cleared: Record<string, string> = {};
    for (const key of AI_SETTING_KEYS) {
      if (key.includes("api_key")) cleared[key] = "";
    }
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleared),
    });
    setLoading(false);
    setValues((v) => ({ ...v, ...cleared }));
    toast.success("API keys cleared from database");
    router.refresh();
  };

  return (
    <div className="rounded-xl border border-primary-100 bg-gradient-to-br from-white to-primary-50/40 p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-primary-800">AI Configuration (Nova)</h2>
            <p className="text-sm text-slate-500">
              Manage API keys in database. Server .env is used as fallback when fields are empty.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1"
            onClick={loadPreview}
            disabled={previewLoading}
          >
            <RefreshCw className={`h-4 w-4 ${previewLoading ? "animate-spin" : ""}`} />
            Preview .env
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1"
            onClick={handleImportEnv}
            disabled={loading}
          >
            <Download className="h-4 w-4" />
            Import from .env
          </Button>
        </div>
      </div>

      <div className="mb-4 grid gap-2 rounded-lg border border-dashed border-slate-200 bg-white/80 p-3 text-xs text-slate-600 md:grid-cols-2">
        {AI_SETTING_KEYS.map((key) => (
          <div key={`env-${key}`} className="flex justify-between gap-2">
            <span className="font-mono text-slate-500">{key}</span>
            <span className="truncate font-mono">
              {masks[key] ? masks[key] : "—"}
              {masks[key] && <span className="ml-1 text-emerald-600">(.env)</span>}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {AI_SETTING_KEYS.map((key) => {
          const isSecret = key.includes("api_key");
          return (
            <div key={key}>
              <Label htmlFor={key}>{LABELS[key] ?? key}</Label>
              {isSecret ? (
                <SecretInput
                  id={key}
                  className="mt-1"
                  placeholder="Leave blank to keep current / use .env"
                  value={values[key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                />
              ) : (
                <Input
                  id={key}
                  type="text"
                  className="mt-1 font-mono text-sm"
                  value={values[key] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
                  autoComplete="off"
                />
              )}
              {initial[key] && isSecret && !values[key] && (
                <p className="mt-1 text-xs text-slate-500">A key is saved in the database (hidden).</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" onClick={handleSave} disabled={loading} className="cursor-pointer gap-1">
          <Save className="h-4 w-4" />
          Save AI settings
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleClear}
          disabled={loading}
          className="cursor-pointer gap-1 text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
          Clear DB keys
        </Button>
      </div>
    </div>
  );
}
