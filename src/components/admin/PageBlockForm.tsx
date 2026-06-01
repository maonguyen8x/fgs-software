"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LocaleTabs } from "./LocaleTabs";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";
import type { PublicPageId } from "@/lib/page-content";

interface PageBlockFormProps {
  page: PublicPageId;
  initial?: {
    id?: string;
    key: string;
    title?: string | null;
    titleJa?: string | null;
    titleVi?: string | null;
    subtitle?: string | null;
    subtitleJa?: string | null;
    subtitleVi?: string | null;
    body?: string | null;
    bodyJa?: string | null;
    bodyVi?: string | null;
    order: number;
    isVisible: boolean;
  };
}

export function PageBlockForm({ page, initial }: PageBlockFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    key: initial?.key ?? "",
    title: initial?.title ?? "",
    titleJa: initial?.titleJa ?? "",
    titleVi: initial?.titleVi ?? "",
    subtitle: initial?.subtitle ?? "",
    subtitleJa: initial?.subtitleJa ?? "",
    subtitleVi: initial?.subtitleVi ?? "",
    body: initial?.body ?? "",
    bodyJa: initial?.bodyJa ?? "",
    bodyVi: initial?.bodyVi ?? "",
    order: initial?.order?.toString() ?? "0",
    isVisible: initial?.isVisible ?? true,
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      page,
      key: form.key,
      title: form.title || undefined,
      titleJa: form.titleJa || undefined,
      titleVi: form.titleVi || undefined,
      subtitle: form.subtitle || undefined,
      subtitleJa: form.subtitleJa || undefined,
      subtitleVi: form.subtitleVi || undefined,
      body: form.body || undefined,
      bodyJa: form.bodyJa || undefined,
      bodyVi: form.bodyVi || undefined,
      order: parseInt(form.order, 10) || 0,
      isVisible: form.isVisible,
    };

    const url = initial?.id ? `/api/admin/page-blocks/${initial.id}` : "/api/admin/page-blocks";
    const method = initial?.id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      showAdminErrorToast("Failed to save");
      return;
    }
    showAdminSuccessToast("Saved");
    router.push(`/admin/pages?page=${page}`);
    router.refresh();
  };

  const tabLabels = { en: "English", ja: "日本語", vi: "Tiếng Việt" };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <div>
        <Label>Block key (unique per page)</Label>
        <Input
          className="mt-1 font-mono"
          value={form.key}
          onChange={(e) => update("key", e.target.value)}
          disabled={Boolean(initial?.id)}
          pattern="[a-z0-9_]+"
          required
        />
      </div>
      <LocaleTabs prefix="title" labels={tabLabels} values={form} onChange={update} />
      <LocaleTabs prefix="subtitle" labels={tabLabels} values={form} onChange={update} multiline />
      <LocaleTabs prefix="body" labels={tabLabels} values={form} onChange={update} multiline />
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
        Visible
      </label>
      <Button type="submit" disabled={loading} className="cursor-pointer">
        {loading ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
