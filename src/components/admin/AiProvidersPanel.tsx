"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download, Plus, Save, Sparkles, Trash2 } from "lucide-react";

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
  const router = useRouter();
  const [providers, setProviders] = useState<AiProviderRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/ai-providers");
    if (res.ok) setProviders(await res.json());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleImportEnv = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/ai-providers/import-env", { method: "POST" });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Import failed");
      return;
    }
    toast.success(data.message ?? "Imported from .env");
    await load();
    router.refresh();
  };

  const saveProvider = async (p: AiProviderRow) => {
    const payload = {
      providerType: p.providerType,
      displayName: p.displayName,
      model: p.model,
      isEnabled: p.isEnabled,
      order: p.order,
      ...(p.apiKey && !p.apiKey.includes("•") ? { apiKey: p.apiKey } : {}),
    };
    const url = p.id.startsWith("new-") ? "/api/admin/ai-providers" : `/api/admin/ai-providers/${p.id}`;
    const method = p.id.startsWith("new-") ? "POST" : "PUT";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      toast.error("Save failed");
      return;
    }
    toast.success("Provider saved");
    await load();
  };

  const deleteProvider = async (id: string) => {
    if (id.startsWith("new-")) {
      setProviders((list) => list.filter((p) => p.id !== id));
      return;
    }
    if (!confirm("Delete this AI provider?")) return;
    await fetch(`/api/admin/ai-providers/${id}`, { method: "DELETE" });
    toast.success("Deleted");
    await load();
  };

  const addProvider = () => {
    setProviders((list) => [
      ...list,
      {
        id: `new-${Date.now()}`,
        providerType: "openai",
        displayName: "New Provider",
        model: "gpt-4o-mini",
        isEnabled: true,
        order: list.length,
      },
    ]);
  };

  return (
    <div className="rounded-xl border border-primary-100 bg-gradient-to-br from-white to-primary-50/30 p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-primary-800">AI Providers</h2>
            <p className="text-sm text-slate-500">OpenAI, Gemini, Claude — sync from .env or edit here.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" className="cursor-pointer" onClick={handleImportEnv} disabled={loading}>
            <Download className="mr-1 h-4 w-4" />
            Import from .env
          </Button>
          <Button type="button" size="sm" className="cursor-pointer" onClick={addProvider}>
            <Plus className="mr-1 h-4 w-4" />
            Add provider
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {providers.map((p, idx) => (
          <div key={p.id} className="rounded-xl border border-slate-200/80 bg-white p-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label>Type</Label>
                <select
                  className="mt-1 w-full rounded-lg border px-2 py-2 text-sm"
                  value={p.providerType}
                  onChange={(e) => {
                    const next = [...providers];
                    next[idx] = { ...p, providerType: e.target.value };
                    setProviders(next);
                  }}
                >
                  {PROVIDER_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Display name</Label>
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
                <Label>Model</Label>
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
                <Label>API Key</Label>
                <Input
                  type="password"
                  className="mt-1 font-mono text-sm"
                  placeholder="Leave blank to keep existing"
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
                  Enabled
                </label>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button type="button" size="sm" className="cursor-pointer" onClick={() => saveProvider(p)}>
                <Save className="mr-1 h-3 w-3" />
                Save
              </Button>
              <Button type="button" size="sm" variant="outline" className="cursor-pointer text-red-600" onClick={() => deleteProvider(p.id)}>
                <Trash2 className="mr-1 h-3 w-3" />
                Delete
              </Button>
            </div>
          </div>
        ))}
        {providers.length === 0 && (
          <p className="text-sm text-slate-500">No providers yet. Click Import from .env or Add provider.</p>
        )}
      </div>
    </div>
  );
}
