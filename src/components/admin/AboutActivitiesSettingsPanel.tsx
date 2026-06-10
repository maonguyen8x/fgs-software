"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";
import { publishPublicSiteUpdate } from "@/lib/admin-public-sync";

interface ActivityRow {
  id: string;
  title: string;
  titleJa: string | null;
  titleVi: string | null;
  description: string | null;
  descriptionJa: string | null;
  descriptionVi: string | null;
  images: string[];
  order: number;
  isVisible: boolean;
}

type DraftRow = ActivityRow & { dirty?: boolean };

export function AboutActivitiesSettingsPanel() {
  const t = useTranslations("admin.settings.about_activities");
  const router = useRouter();
  const [rows, setRows] = useState<DraftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/activities");
      if (!res.ok) throw new Error("fetch");
      const data = (await res.json()) as ActivityRow[];
      setRows(data);
    } catch {
      showAdminErrorToast(t("load_failed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    return (await res.json()) as { url?: string; code?: string };
  };

  const createFromImages = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;
    setUploading(true);
    try {
      const maxOrder = rows.reduce((max, r) => Math.max(max, r.order), -1);
      let created = 0;
      for (let i = 0; i < list.length; i++) {
        const result = await uploadFile(list[i]);
        if (!result.url) continue;
        const res = await fetch("/api/admin/activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: t("default_title"),
            images: [result.url],
            order: maxOrder + 1 + i,
            isVisible: true,
          }),
        });
        if (res.ok) created++;
      }
      if (created === 0) {
        showAdminErrorToast(t("upload_failed"));
        return;
      }
      showAdminSuccessToast(
        created > 1 ? t("upload_many_success", { count: created }) : t("upload_success")
      );
      await loadRows();
      publishPublicSiteUpdate(router);
    } catch {
      showAdminErrorToast(t("upload_failed"));
    } finally {
      setUploading(false);
    }
  };

  const updateRow = (id: string, patch: Partial<DraftRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch, dirty: true } : r)));
  };

  const saveRow = async (row: DraftRow) => {
    setSavingId(row.id);
    const res = await fetch(`/api/admin/activities/${row.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: row.title.trim() || t("default_title"),
        titleJa: row.titleJa?.trim() || undefined,
        titleVi: row.titleVi?.trim() || undefined,
        description: row.description?.trim() || undefined,
        descriptionJa: row.descriptionJa?.trim() || undefined,
        descriptionVi: row.descriptionVi?.trim() || undefined,
        images: row.images,
        order: row.order,
        isVisible: row.isVisible,
      }),
    });
    setSavingId(null);
    if (!res.ok) {
      showAdminErrorToast(t("save_failed"));
      return;
    }
    showAdminSuccessToast(t("save_success"));
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, dirty: false } : r)));
    publishPublicSiteUpdate(router);
  };

  const deleteRow = async (id: string) => {
    if (!confirm(t("delete_confirm"))) return;
    const res = await fetch(`/api/admin/activities/${id}`, { method: "DELETE" });
    if (!res.ok) {
      showAdminErrorToast(t("delete_failed"));
      return;
    }
    showAdminSuccessToast(t("delete_success"));
    setRows((prev) => prev.filter((r) => r.id !== id));
    publishPublicSiteUpdate(router);
  };

  const moveRow = async (id: string, direction: -1 | 1) => {
    const index = rows.findIndex((r) => r.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= rows.length) return;
    const next = [...rows];
    const a = next[index];
    const b = next[target];
    next[index] = { ...b, order: a.order };
    next[target] = { ...a, order: b.order };
    setRows(next);
    await Promise.all([
      fetch(`/api/admin/activities/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: b.order }),
      }),
      fetch(`/api/admin/activities/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: a.order }),
      }),
    ]);
    publishPublicSiteUpdate(router);
  };

  const replaceImage = async (id: string, file: File) => {
    setUploading(true);
    try {
      const result = await uploadFile(file);
      if (!result.url) {
        showAdminErrorToast(t("upload_failed"));
        return;
      }
      updateRow(id, { images: [result.url] });
      showAdminSuccessToast(t("upload_success"));
    } catch {
      showAdminErrorToast(t("upload_failed"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <ImageIcon className="h-5 w-5 text-primary-600" />
          {t("title")}
        </h2>
        <p className="mt-1 text-sm text-slate-600">{t("subtitle")}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-slate-50">
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const files = e.target.files;
              if (files?.length) void createFromImages(files);
              e.target.value = "";
            }}
          />
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {t("upload_images")}
        </label>
        <p className="text-xs text-slate-500">{t("upload_hint")}</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("loading")}
        </div>
      ) : rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center text-sm text-slate-500">
          {t("empty")}
        </p>
      ) : (
        <ul className="space-y-4">
          {rows.map((row, index) => {
            const imageUrl = row.images[0];
            return (
              <li
                key={row.id}
                className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-4 lg:flex-row">
                  <div className="relative mx-auto aspect-[4/3] w-full max-w-xs shrink-0 overflow-hidden rounded-lg bg-slate-100 lg:mx-0">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="320px"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <ImageIcon className="h-10 w-10" />
                      </div>
                    )}
                    <label className="absolute bottom-2 right-2 cursor-pointer rounded-md bg-white/90 px-2 py-1 text-xs font-medium shadow hover:bg-white">
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        disabled={uploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void replaceImage(row.id, file);
                          e.target.value = "";
                        }}
                      />
                      {t("replace_image")}
                    </label>
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <Label className="text-xs">{t("description_en")}</Label>
                        <Textarea
                          className="mt-1 min-h-[80px] text-sm"
                          value={row.description ?? ""}
                          onChange={(e) => updateRow(row.id, { description: e.target.value })}
                          placeholder={t("description_placeholder")}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t("description_vi")}</Label>
                        <Textarea
                          className="mt-1 min-h-[80px] text-sm"
                          value={row.descriptionVi ?? ""}
                          onChange={(e) => updateRow(row.id, { descriptionVi: e.target.value })}
                          placeholder={t("description_placeholder")}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t("description_ja")}</Label>
                        <Textarea
                          className="mt-1 min-h-[80px] text-sm"
                          value={row.descriptionJa ?? ""}
                          onChange={(e) => updateRow(row.id, { descriptionJa: e.target.value })}
                          placeholder={t("description_placeholder")}
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 cursor-pointer"
                          disabled={index === 0}
                          onClick={() => void moveRow(row.id, -1)}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 cursor-pointer"
                          disabled={index === rows.length - 1}
                          onClick={() => void moveRow(row.id, 1)}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => updateRow(row.id, { isVisible: !row.isVisible })}
                      >
                        {row.isVisible ? (
                          <>
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            {t("visible")}
                          </>
                        ) : (
                          <>
                            <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                            {t("hidden")}
                          </>
                        )}
                      </Button>

                      <div className="flex items-center gap-1.5">
                        <Label className="text-xs text-slate-500">{t("order")}</Label>
                        <Input
                          type="number"
                          className="h-8 w-16 text-sm"
                          value={row.order}
                          onChange={(e) =>
                            updateRow(row.id, { order: parseInt(e.target.value, 10) || 0 })
                          }
                        />
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        className="cursor-pointer"
                        disabled={savingId === row.id}
                        onClick={() => void saveRow(row)}
                      >
                        {savingId === row.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          t("save")
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer text-red-600 hover:text-red-700"
                        onClick={() => void deleteRow(row.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-xs text-slate-500">{t("display_hint")}</p>
    </div>
  );
}
