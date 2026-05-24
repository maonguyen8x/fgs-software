"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { Label } from "@/components/ui/label";
import { LocaleTabs } from "./LocaleTabs";
import { toast } from "sonner";

interface CoreValueFormProps {
  initial?: {
    id?: string;
    icon: string;
    title: string;
    titleJa?: string | null;
    titleVi?: string | null;
    description: string;
    descriptionJa?: string | null;
    descriptionVi?: string | null;
    order: number;
    isVisible: boolean;
  };
}

export function CoreValueForm({ initial }: CoreValueFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    icon: initial?.icon ?? "Star",
    title: initial?.title ?? "",
    titleJa: initial?.titleJa ?? "",
    titleVi: initial?.titleVi ?? "",
    description: initial?.description ?? "",
    descriptionJa: initial?.descriptionJa ?? "",
    descriptionVi: initial?.descriptionVi ?? "",
    order: initial?.order?.toString() ?? "0",
    isVisible: initial?.isVisible ?? true,
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      icon: form.icon,
      title: form.title,
      titleJa: form.titleJa || undefined,
      titleVi: form.titleVi || undefined,
      description: form.description,
      descriptionJa: form.descriptionJa || undefined,
      descriptionVi: form.descriptionVi || undefined,
      order: parseInt(form.order, 10) || 0,
      isVisible: form.isVisible,
    };

    const url = initial?.id ? `/api/admin/core-values/${initial.id}` : "/api/admin/core-values";
    const method = initial?.id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error("Failed to save");
      return;
    }
    toast.success("Saved");
    router.push("/admin/core-values");
    router.refresh();
  };

  const tabLabels = { en: "English", ja: "日本語", vi: "Tiếng Việt" };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <div>
        <RequiredLabel required>Lucide icon name</RequiredLabel>
        <Input
          className="mt-1"
          placeholder="Heart, Users, Lightbulb, Shield..."
          value={form.icon}
          onChange={(e) => update("icon", e.target.value)}
          required
        />
        <p className="mt-1 text-xs text-slate-500">Use names from lucide-react (e.g. Star, Globe, Zap)</p>
      </div>
      <LocaleTabs prefix="title" labels={tabLabels} values={form} onChange={update} required />
      <LocaleTabs prefix="description" labels={tabLabels} values={form} onChange={update} multiline required />
      <div>
        <Label>Order</Label>
        <Input type="number" className="mt-1 w-32" value={form.order} onChange={(e) => update("order", e.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isVisible}
          onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.checked }))}
        />
        Visible on About page
      </label>
      <Button type="submit" disabled={loading} className="cursor-pointer">
        {loading ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
