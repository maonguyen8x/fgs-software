"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { Label } from "@/components/ui/label";
import { LocaleTabs } from "./LocaleTabs";
import { toast } from "sonner";

export function ServiceForm({
  initial,
}: {
  initial?: {
    id?: string;
    icon: string;
    title: string;
    titleJa?: string | null;
    titleVi?: string | null;
    description: string;
    descriptionJa?: string | null;
    descriptionVi?: string | null;
    techStack: string[];
    order: number;
    isVisible: boolean;
  };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    icon: initial?.icon ?? "Code2",
    title: initial?.title ?? "",
    titleJa: initial?.titleJa ?? "",
    titleVi: initial?.titleVi ?? "",
    description: initial?.description ?? "",
    descriptionJa: initial?.descriptionJa ?? "",
    descriptionVi: initial?.descriptionVi ?? "",
    techStack: initial?.techStack?.join(", ") ?? "",
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
      techStack: form.techStack.split(",").map((s) => s.trim()).filter(Boolean),
      order: parseInt(form.order, 10) || 0,
      isVisible: form.isVisible,
    };
    const url = initial?.id ? `/api/admin/services/${initial.id}` : "/api/admin/services";
    const res = await fetch(url, {
      method: initial?.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) { toast.error("Failed"); return; }
    toast.success("Saved");
    router.push("/admin/services");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 rounded-lg border bg-white p-6">
      <div>
        <RequiredLabel required>Lucide Icon Name</RequiredLabel>
        <Input className="mt-1" value={form.icon} onChange={(e) => update("icon", e.target.value)} required placeholder="e.g. Globe, Code2" />
      </div>
      <LocaleTabs prefix="title" labels={{ en: "English", ja: "日本語", vi: "Tiếng Việt" }} values={form} onChange={update} required />
      <LocaleTabs prefix="description" labels={{ en: "English", ja: "日本語", vi: "Tiếng Việt" }} values={form} onChange={update} multiline required />
      <div>
        <Label>Tech Stack (comma-separated)</Label>
        <Input className="mt-1" value={form.techStack} onChange={(e) => update("techStack", e.target.value)} />
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.checked }))} />
        Visible
      </label>
      <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
    </form>
  );
}
