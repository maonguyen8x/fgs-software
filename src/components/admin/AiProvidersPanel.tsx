"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AdminSelect } from "@/components/admin/AdminSelect";
import { Input } from "@/components/ui/input";
import { SecretInput } from "@/components/ui/secret-input";
import { Label } from "@/components/ui/label";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  Download,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { maskSecretForInput } from "@/lib/ai/mask-secret";

interface AiProviderRow {
  id: string;
  providerType: string;
  displayName: string;
  apiKey?: string | null;
  model: string;
  isEnabled: boolean;
  order: number;
}

const PROVIDER_TYPES = [
  { value: "openai", label: "OpenAI" },
  { value: "gemini", label: "Google Gemini" },
  { value: "anthropic", label: "Anthropic Claude" },
];

export function AiProvidersPanel() {
  const t = useTranslations("admin.settings.ai_providers");
  const router = useRouter();
  const [providers, setProviders] = useState<AiProviderRow[]>([]);
  const [activeProvider, setActiveProvider] = useState<string>("auto");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/ai-providers");
    if (!res.ok) return;
    const data = (await res.json()) as {
      providers?: AiProviderRow[];
      activeProvider?: string;
    };
    if (Array.isArray(data)) {
      setProviders(data);
      return;
    }
    setProviders(data.providers ?? []);
    setActiveProvider(data.activeProvider ?? "auto");
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSyncFromEnv = async () => {
    setLoading(true);
    const [providersRes, settingsRes] = await Promise.all([
      fetch("/api/admin/ai-providers/import-env", { method: "POST" }),
      fetch("/api/admin/settings/import-env", { method: "POST" }),
    ]);
    setLoading(false);
    const providersData = await providersRes.json();
    const settingsData = await settingsRes.json();
    if (!providersRes.ok && !settingsRes.ok) {
      showAdminErrorToast(providersData.error ?? settingsData.error ?? t("sync_from_failed"));
      return;
    }
    const parts = [providersData.message, settingsData.message].filter(Boolean);
    showAdminSuccessToast(parts.join(" ") || t("sync_from_success"));
    await load();
    router.refresh();
  };

  const handleSyncToEnv = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/ai-providers/sync-to-env", { method: "POST" });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      showAdminErrorToast(data.error ?? data.message ?? t("sync_to_failed"));
      return;
    }
    showAdminSuccessToast(data.message ?? t("sync_to_success"));
  };

  const activateForNova = async (providerType: string) => {
    setLoading(true);
    const res = await fetch("/api/admin/ai-providers/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerType }),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      showAdminErrorToast(data.error ?? t("activate_failed"));
      return;
    }
    setActiveProvider(data.activeProvider ?? providerType);
    showAdminSuccessToast(t("activate_success", { name: providerType }));
    router.refresh();
  };

  const saveProvider = async (p: AiProviderRow, index: number) => {
    const rawKey = p.apiKey?.trim() ?? "";
    const sendingNewKey = rawKey.length > 0 && !rawKey.includes("•");
    const payload = {
      providerType: p.providerType,
      displayName: p.displayName,
      model: p.model,
      isEnabled: p.isEnabled,
      order: p.order,
      ...(sendingNewKey ? { apiKey: rawKey } : {}),
    };
    const url = p.id.startsWith("new-") ? "/api/admin/ai-providers" : `/api/admin/ai-providers/${p.id}`;
    const method = p.id.startsWith("new-") ? "POST" : "PUT";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      showAdminErrorToast(t("save_failed"));
      return;
    }
    const saved = (await res.json()) as AiProviderRow;
    showAdminSuccessToast(t("save_success"));
    setProviders((list) => {
      const next = [...list];
      next[index] = {
        ...next[index],
        ...saved,
        apiKey: sendingNewKey
          ? maskSecretForInput(rawKey)
          : maskSecretForInput(saved.apiKey ?? next[index].apiKey),
      };
      return next;
    });
    await load();
  };

  const deleteProvider = async (id: string) => {
    if (id.startsWith("new-")) {
      setProviders((list) => list.filter((p) => p.id !== id));
      return;
    }
    if (!confirm(t("delete_confirm"))) return;
    await fetch(`/api/admin/ai-providers/${id}`, { method: "DELETE" });
    showAdminSuccessToast(t("delete_success"));
    await load();
  };

  const addProvider = () => {
    setProviders((list) => [
      ...list,
      {
        id: `new-${Date.now()}`,
        providerType: "openai",
        displayName: t("new_provider_name"),
        model: "gpt-4o-mini",
        isEnabled: true,
        order: list.length,
      },
    ]);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-primary-800">{t("title")}</h2>
            <p className="text-sm text-slate-500">{t("subtitle")}</p>
            {activeProvider && activeProvider !== "auto" && (
              <p className="mt-1 text-xs font-medium text-primary-600">
                {t("active_label")}: {activeProvider.toUpperCase()}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => void handleSyncFromEnv()}
            disabled={loading}
          >
            <ArrowDownToLine className="mr-1 h-4 w-4" />
            {t("sync_from_env")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => void handleSyncToEnv()}
            disabled={loading}
          >
            <ArrowUpFromLine className="mr-1 h-4 w-4" />
            {t("sync_to_env")}
          </Button>
          <Button type="button" size="sm" className="cursor-pointer" onClick={addProvider}>
            <Plus className="mr-1 h-4 w-4" />
            {t("add_provider")}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {providers.map((p, idx) => {
          const isActive = activeProvider === p.providerType;
          return (
            <div
              key={p.id}
              className={cn(
                "rounded-xl border bg-white p-4 transition-shadow",
                isActive
                  ? "border-primary-400 ring-2 ring-primary-100 shadow-md"
                  : "border-slate-200/80"
              )}
            >
              {isActive && (
                <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {t("active_nova")}
                </span>
              )}
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label>{t("type")}</Label>
                  <AdminSelect
                    value={p.providerType}
                    onChange={(e) => {
                      const next = [...providers];
                      next[idx] = { ...p, providerType: e.target.value };
                      setProviders(next);
                    }}
                  >
                    {PROVIDER_TYPES.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </AdminSelect>
                </div>
                <div>
                  <Label>{t("display_name")}</Label>
                  <Input
                    className="mt-1"
                    value={p.displayName}
                    onChange={(e) => {
                      const next = [...providers];
                      next[idx] = { ...p, displayName: e.target.value };
                      setProviders(next);
                    }}
                  />
                </div>
                <div>
                  <Label>{t("model")}</Label>
                  <Input
                    className="mt-1"
                    value={p.model}
                    onChange={(e) => {
                      const next = [...providers];
                      next[idx] = { ...p, model: e.target.value };
                      setProviders(next);
                    }}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>{t("api_key")}</Label>
                  <SecretInput
                    className="mt-1"
                    placeholder={t("api_key_placeholder")}
                    value={p.apiKey ?? ""}
                    onChange={(e) => {
                      const next = [...providers];
                      next[idx] = { ...p, apiKey: e.target.value };
                      setProviders(next);
                    }}
                  />
                </div>
                <div className="flex items-end gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={p.isEnabled}
                      onChange={(e) => {
                        const next = [...providers];
                        next[idx] = { ...p, isEnabled: e.target.checked };
                        setProviders(next);
                      }}
                    />
                    {t("enabled")}
                  </label>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={isActive ? "secondary" : "default"}
                  className="cursor-pointer"
                  disabled={loading || !p.isEnabled}
                  onClick={() => void activateForNova(p.providerType)}
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {isActive ? t("active_nova") : t("activate_nova")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => void saveProvider(p, idx)}
                >
                  <Save className="mr-1 h-3 w-3" />
                  {t("save")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="cursor-pointer text-red-600"
                  onClick={() => void deleteProvider(p.id)}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  {t("delete")}
                </Button>
              </div>
            </div>
          );
        })}
        {providers.length === 0 && (
          <p className="text-sm text-slate-500">{t("empty")}</p>
        )}
      </div>
    </div>
  );
}
