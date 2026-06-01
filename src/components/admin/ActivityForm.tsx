"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocaleTabs } from "./LocaleTabs";
import { ImageUrlsField } from "./ImageUrlsField";
import { toast } from "sonner";

interface ActivityFormProps {
  initial?: {
    id?: string;
    title: string;
    titleJa?: string | null;
    titleVi?: string | null;
    description?: string | null;
    descriptionJa?: string | null;
    descriptionVi?: string | null;
    images?: string[];
    order: number;
    isVisible: boolean;
  };
}

export function ActivityForm({ initial }: ActivityFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: initial?.title ?? "",
    titleJa: initial?.titleJa ?? "",
    titleVi: initial?.titleVi ?? "",
    description: initial?.description ?? "",
    descriptionJa: initial?.descriptionJa ?? "",
    descriptionVi: initial?.descriptionVi ?? "",
    images: initial?.images ?? [],
    order: initial?.order?.toString() ?? "0",
    isVisible: initial?.isVisible ?? true,
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      title: form.title,
      titleJa: form.titleJa || undefined,
      titleVi: form.titleVi || undefined,
      description: form.description || undefined,
      descriptionJa: form.descriptionJa || undefined,
      descriptionVi: form.descriptionVi || undefined,
      images: form.images,
      order: parseInt(form.order, 10) || 0,
      isVisible: form.isVisible,
    };

    const url = initial?.id ? `/api/admin/activities/${initial.id}` : "/api/admin/activities";
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
    router.push("/admin/activities");
    router.refresh();
  };

  const tabLabels = { en: "English", ja: "日本語", vi: "Tiếng Việt" };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <LocaleTabs
        prefix="title"
        labels={tabLabels}
        values={{ title: form.title, titleJa: form.titleJa, titleVi: form.titleVi }}
        onChange={update}
        required
      />
      <LocaleTabs
        prefix="description"
        labels={tabLabels}
        values={{
          description: form.description,
          descriptionJa: form.descriptionJa,
          descriptionVi: form.descriptionVi,
        }}
        onChange={update}
        multiline
      />
      <ImageUrlsField
        label="Activity images"
        urls={form.images}
        onChange={(images) => setForm((f) => ({ ...f, images }))}
      />
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
