"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocaleTabs } from "./LocaleTabs";
import { ImageUploadField } from "./ImageUploadField";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";
import { publishPublicSiteUpdate } from "@/lib/admin-public-sync";

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
  const t = useTranslations("admin.partners.form");
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
    if (!form.name.trim()) {
      showAdminErrorToast(t("name_required"));
      return;
    }

    setLoading(true);
    const payload = {
      name: form.name.trim(),
      nameJa: form.nameJa.trim() || undefined,
      nameVi: form.nameVi.trim() || undefined,
      logoUrl: form.logoUrl.trim() || undefined,
      websiteUrl: form.websiteUrl.trim() || undefined,
      order: parseInt(form.order, 10) || 0,
      isVisible: form.isVisible,
    };
    const url = initial?.id ? `/api/admin/partners/${initial.id}` : "/api/admin/partners";
    const method = initial?.id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);

    if (!res.ok) {
      showAdminErrorToast(t("save_failed"));
      return;
    }

    showAdminSuccessToast(t("save_success"));
    publishPublicSiteUpdate(router);
    router.push("/admin/partners");
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl space-y-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm md:p-8"
    >
      <LocaleTabs
        prefix="name"
        labels={{ en: "English", ja: "日本語", vi: "Tiếng Việt" }}
        values={form}
        onChange={update}
        required
      />

      <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
        <ImageUploadField
          label={t("logo")}
          hint={t("logo_hint")}
          value={form.logoUrl || null}
          onChange={(url) => update("logoUrl", url)}
          objectFit="contain"
          previewHeightClass="h-32"
        />
      </div>

      <div>
        <Label>{t("website")}</Label>
        <Input
          className="mt-1"
          type="url"
          placeholder="https://"
          value={form.websiteUrl}
          onChange={(e) => update("websiteUrl", e.target.value)}
        />
      </div>

      <div>
        <Label>{t("order")}</Label>
        <Input
          type="number"
          className="mt-1 w-32"
          min={0}
          value={form.order}
          onChange={(e) => update("order", e.target.value)}
        />
        <p className="mt-1 text-xs text-slate-500">{t("order_hint")}</p>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="accent-primary-600"
          checked={form.isVisible}
          onChange={(e) => setForm((f) => ({ ...f, isVisible: e.target.checked }))}
        />
        {t("visible")}
      </label>

      <Button type="submit" disabled={loading} className="cursor-pointer">
        {loading ? t("saving") : t("save")}
      </Button>
    </form>
  );
}
