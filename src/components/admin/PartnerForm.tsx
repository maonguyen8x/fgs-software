"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocaleTabs } from "./LocaleTabs";
import { toast } from "sonner";

interface PartnerFormProps {
  initial?: {
    id?: string;
    name: string;
    nameJa?: string | null;
    nameVi?: string | null;
    logoUrl?: string | null;
    websiteUrl?: string | null;
    order: number;
    isVisible: boolean;
  };
}

export function PartnerForm({ initial }: PartnerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    nameJa: initial?.nameJa ?? "",
    nameVi: initial?.nameVi ?? "",
    logoUrl: initial?.logoUrl ?? "",
    websiteUrl: initial?.websiteUrl ?? "",
    order: initial?.order?.toString() ?? "0",
    isVisible: initial?.isVisible ?? true,
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      name: form.name,
      nameJa: form.nameJa || undefined,
      nameVi: form.nameVi || undefined,
      logoUrl: form.logoUrl || undefined,
      websiteUrl: form.websiteUrl || undefined,
      order: parseInt(form.order, 10) || 0,
      isVisible: form.isVisible,
    };
    const url = initial?.id ? `/api/admin/partners/${initial.id}` : "/api/admin/partners";
    const method = initial?.id ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setLoading(false);
    if (!res.ok) {
      toast.error("Failed to save");
      return;
    }
    toast.success("Saved");
    router.push("/admin/partners");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <LocaleTabs prefix="name" labels={{ en: "English", ja: "日本語", vi: "Tiếng Việt" }} values={form} onChange={update} required />
      <div>
        <Label>Logo URL</Label>
        <Input className="mt-1" value={form.logoUrl} onChange={(e) => update("logoUrl", e.target.value)} />
      </div>
      <div>
        <Label>Website URL</Label>
        <Input className="mt-1" value={form.websiteUrl} onChange={(e) => update("websiteUrl", e.target.value)} />
      </div>
      <div>
        <Label>Order</Label>
        <Input type="number" className="mt-1 w-32" value={form.order} onChange={(e) => update("order", e.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.isVisible} onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.checked }))} />
        Visible
      </label>
      <Button type="submit" disabled={loading} className="cursor-pointer">
        {loading ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
