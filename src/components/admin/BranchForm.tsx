"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { Label } from "@/components/ui/label";
import { LocaleTabs } from "./LocaleTabs";
import { toast } from "sonner";

interface BranchFormProps {
  initial?: {
    id?: string;
    name: string;
    nameJa?: string | null;
    nameVi?: string | null;
    city: string;
    cityJa?: string | null;
    cityVi?: string | null;
    address: string;
    addressJa?: string | null;
    addressVi?: string | null;
    latitude: number;
    longitude: number;
    isHeadquarters: boolean;
    order: number;
    isVisible: boolean;
  };
}

export function BranchForm({ initial }: BranchFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    nameJa: initial?.nameJa ?? "",
    nameVi: initial?.nameVi ?? "",
    city: initial?.city ?? "",
    cityJa: initial?.cityJa ?? "",
    cityVi: initial?.cityVi ?? "",
    address: initial?.address ?? "",
    addressJa: initial?.addressJa ?? "",
    addressVi: initial?.addressVi ?? "",
    latitude: initial?.latitude?.toString() ?? "16.0544",
    longitude: initial?.longitude?.toString() ?? "108.2022",
    order: initial?.order?.toString() ?? "0",
    isHeadquarters: initial?.isHeadquarters ?? true,
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
      city: form.city,
      cityJa: form.cityJa || undefined,
      cityVi: form.cityVi || undefined,
      address: form.address,
      addressJa: form.addressJa || undefined,
      addressVi: form.addressVi || undefined,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      isHeadquarters: form.isHeadquarters,
      order: parseInt(form.order, 10) || 0,
      isVisible: form.isVisible,
    };

    const url = initial?.id ? `/api/admin/branches/${initial.id}` : "/api/admin/branches";
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
    router.push("/admin/branches");
    router.refresh();
  };

  const tabLabels = { en: "English", ja: "日本語", vi: "Tiếng Việt" };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <LocaleTabs prefix="name" labels={tabLabels} values={form} onChange={update} required />
      <LocaleTabs prefix="city" labels={tabLabels} values={form} onChange={update} required />
      <LocaleTabs prefix="address" labels={tabLabels} values={form} onChange={update} multiline required />
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <RequiredLabel required>Latitude</RequiredLabel>
          <Input className="mt-1" type="number" step="any" value={form.latitude} onChange={(e) => update("latitude", e.target.value)} required />
        </div>
        <div>
          <RequiredLabel required>Longitude</RequiredLabel>
          <Input className="mt-1" type="number" step="any" value={form.longitude} onChange={(e) => update("longitude", e.target.value)} required />
        </div>
      </div>
      <div>
        <Label>Order</Label>
        <Input type="number" className="mt-1 w-32" value={form.order} onChange={(e) => update("order", e.target.value)} />
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isHeadquarters}
            onChange={(e) => setForm((f) => ({ ...f, isHeadquarters: e.target.checked }))}
          />
          Headquarters
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isVisible}
            onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.checked }))}
          />
          Visible
        </label>
      </div>
      <Button type="submit" disabled={loading} className="cursor-pointer">
        {loading ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
