"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RequiredLabel } from "@/components/ui/RequiredLabel";
import { Label } from "@/components/ui/label";
import { LocaleTabs } from "./LocaleTabs";
import { ImageUrlsField } from "./ImageUrlsField";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";
import { publishPublicSiteUpdate } from "@/lib/admin-public-sync";

interface TimelineFormProps {
  initial?: {
    id?: string;
    milestoneDate: string;
    title: string;
    titleJa?: string | null;
    titleVi?: string | null;
    description?: string | null;
    descriptionJa?: string | null;
    descriptionVi?: string | null;
    memberCount?: number;
    images?: string[];
    order: number;
    isVisible: boolean;
  };
}

export function TimelineForm({ initial }: TimelineFormProps) {
  const t = useTranslations("admin.timeline");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    milestoneDate: initial?.milestoneDate ?? "2026-05",
    title: initial?.title ?? "",
    titleJa: initial?.titleJa ?? "",
    titleVi: initial?.titleVi ?? "",
    description: initial?.description ?? "",
    descriptionJa: initial?.descriptionJa ?? "",
    descriptionVi: initial?.descriptionVi ?? "",
    memberCount: initial?.memberCount?.toString() ?? "0",
    images: initial?.images ?? [],
    order: initial?.order?.toString() ?? "0",
    isVisible: initial?.isVisible ?? true,
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      milestoneDate: form.milestoneDate,
      title: form.title,
      titleJa: form.titleJa || undefined,
      titleVi: form.titleVi || undefined,
      description: form.description || undefined,
      descriptionJa: form.descriptionJa || undefined,
      descriptionVi: form.descriptionVi || undefined,
      memberCount: parseInt(form.memberCount, 10) || 0,
      images: form.images,
      order: parseInt(form.order, 10) || 0,
      isVisible: form.isVisible,
    };

    const url = initial?.id ? `/api/admin/timeline/${initial.id}` : "/api/admin/timeline";
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
    router.push("/admin/timeline");
    router.refresh();
  };

  const tabLabels = { en: "English", ja: "日本語", vi: "Tiếng Việt" };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 rounded-2xl border bg-white p-6 shadow-sm md:p-8">
      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
        <RequiredLabel required>{t("date_label")}</RequiredLabel>
        <Input
          className="mt-1 max-w-xs font-mono"
          placeholder="2026-05"
          pattern="\d{4}-\d{2}"
          value={form.milestoneDate}
          onChange={(e) => update("milestoneDate", e.target.value)}
          required
        />
        <p className="mt-1 text-xs text-slate-500">{t("date_hint")}</p>
      </div>

      <LocaleTabs
        prefix="title"
        sectionTitle={t("title_section")}
        labels={tabLabels}
        values={{ title: form.title, titleJa: form.titleJa, titleVi: form.titleVi }}
        onChange={update}
        required
      />

      <LocaleTabs
        prefix="description"
        sectionTitle={t("description_section")}
        labels={tabLabels}
        values={{
          description: form.description,
          descriptionJa: form.descriptionJa,
          descriptionVi: form.descriptionVi,
        }}
        onChange={update}
        multiline
      />

      <div>
        <Label>{t("member_count")}</Label>
        <Input
          type="number"
          min={0}
          className="mt-1 w-32"
          value={form.memberCount}
          onChange={(e) => update("memberCount", e.target.value)}
        />
      </div>

      <ImageUrlsField
        label={t("images")}
        hint={t("images_hint")}
        urls={form.images}
        onChange={(images) => setForm((f) => ({ ...f, images }))}
        objectFit="contain"
      />

      <div>
        <Label>{t("order")}</Label>
        <Input type="number" className="mt-1 w-32" value={form.order} onChange={(e) => update("order", e.target.value)} />
      </div>

      <label className="flex items-center gap-2 text-sm">
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
