"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ImageIcon, Loader2, History, RotateCcw, Save, Upload, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlueRadioGroup } from "@/components/ui/BlueRadio";
import { processLogoFile } from "@/lib/admin/process-logo-file";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";
import { FgsLogo } from "@/components/brand/FgsLogo";
import {
  LOGO_BACKUP_KEY,
  LOGO_MODE_KEY,
  LOGO_URL_KEY,
  type LogoDisplayMode,
} from "@/lib/brand-logo";

interface LogoSettingsPanelProps {
  settings: Record<string, string>;
}

export function LogoSettingsPanel({ settings: initial }: LogoSettingsPanelProps) {
  const t = useTranslations("admin.settings.logo");
  const router = useRouter();
  const savedUrl = initial[LOGO_URL_KEY] ?? "";
  const savedBackup = initial[LOGO_BACKUP_KEY] ?? "";
  const savedMode: LogoDisplayMode =
    initial[LOGO_MODE_KEY] === "image" && savedUrl.trim() ? "image" : "text";

  const [mode, setMode] = useState<LogoDisplayMode>(savedMode);
  const [logoUrl, setLogoUrl] = useState(savedUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const previewMode = mode;
  const previewUrl = mode === "image" ? logoUrl.trim() || null : null;

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const processed = await processLogoFile(file);
        const formData = new FormData();
        formData.append("file", processed);
        const res = await fetch("/api/admin/upload/logo", { method: "POST", body: formData });
        const data = (await res.json()) as { url?: string; code?: string };
        if (!res.ok || !data.url) {
          if (data.code === "INVALID_TYPE") showAdminErrorToast(t("error_invalid_type"));
          else if (data.code === "FILE_TOO_LARGE") showAdminErrorToast(t("error_too_large"));
          else showAdminErrorToast(t("upload_failed"));
          return;
        }
        setLogoUrl(data.url);
        setMode("image");
        showAdminSuccessToast(t("upload_success"));
      } catch (e) {
        const code = e instanceof Error ? e.message : "";
        if (code === "INVALID_TYPE") showAdminErrorToast(t("error_invalid_type"));
        else if (code === "FILE_TOO_LARGE") showAdminErrorToast(t("error_too_large"));
        else if (code === "PROCESS_FAILED") showAdminErrorToast(t("error_process"));
        else showAdminErrorToast(t("upload_failed"));
      } finally {
        setUploading(false);
      }
    },
    [t]
  );

  const persistSettings = async (patch: Record<string, string>) => {
    setSaving(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSaving(false);
    if (!res.ok) {
      showAdminErrorToast(t("save_failed"));
      return false;
    }
    showAdminSuccessToast(t("save_success"));
    router.refresh();
    return true;
  };

  const handleSave = async () => {
    const nextUrl = logoUrl.trim();
    const nextMode: LogoDisplayMode = mode === "image" && nextUrl ? "image" : "text";
    const patch: Record<string, string> = {
      [LOGO_MODE_KEY]: nextMode,
      [LOGO_URL_KEY]: nextMode === "image" ? nextUrl : "",
    };
    const previous = savedUrl.trim();
    if (nextMode === "image" && nextUrl && previous && nextUrl !== previous) {
      patch[LOGO_BACKUP_KEY] = previous;
    }
    await persistSettings(patch);
  };

  const handleRestoreDefault = async () => {
    setMode("text");
    setLogoUrl("");
    await persistSettings({
      [LOGO_MODE_KEY]: "text",
      [LOGO_URL_KEY]: "",
      [LOGO_BACKUP_KEY]: savedBackup,
    });
  };

  const handleRestoreBackup = async () => {
    if (!savedBackup.trim()) {
      showAdminErrorToast(t("no_backup"));
      return;
    }
    setLogoUrl(savedBackup);
    setMode("image");
    await persistSettings({
      [LOGO_MODE_KEY]: "image",
      [LOGO_URL_KEY]: savedBackup,
      [LOGO_BACKUP_KEY]: savedUrl.trim() || savedBackup,
    });
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t("title")}</h2>
            <p className="text-sm text-slate-500">{t("subtitle_choice")}</p>
            <p className="mt-1 text-xs text-slate-500">{t("size_hint")}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1"
            disabled={saving || uploading || !savedBackup.trim()}
            onClick={() => void handleRestoreBackup()}
          >
            <History className="h-4 w-4" />
            {t("restore_backup")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1"
            disabled={saving || uploading}
            onClick={() => void handleRestoreDefault()}
          >
            <RotateCcw className="h-4 w-4" />
            {t("restore_default")}
          </Button>
        </div>
      </div>

      <BlueRadioGroup
        name="logo-mode"
        value={mode}
        className="mb-6"
        options={[
          { value: "text", label: t("mode_text") },
          { value: "image", label: t("mode_image") },
        ]}
        onChange={(value) => setMode(value as LogoDisplayMode)}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {mode === "image" ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) void uploadFile(file);
            }}
            className={`flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors ${
              dragOver
                ? "border-primary-400 bg-primary-50/50"
                : "border-slate-200 bg-slate-50/50 hover:border-primary-300"
            }`}
          >
            <label className="flex cursor-pointer flex-col items-center text-center">
              <input
                type="file"
                accept="image/png,image/webp,image/svg+xml,image/jpeg"
                className="sr-only"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadFile(file);
                  e.target.value = "";
                }}
              />
              {uploading ? (
                <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary-600" />
              ) : (
                <Upload className="mb-2 h-8 w-8 text-primary-600" />
              )}
              <p className="text-sm font-medium text-slate-700">{t("drop_hint")}</p>
              <p className="mt-1 text-xs text-slate-500">{t("formats")}</p>
            </label>
          </div>
        ) : (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-6 dark:border-slate-700">
            <Type className="mb-2 h-8 w-8 text-primary-600" />
            <p className="text-center text-sm text-muted-theme">{t("mode_text_hint")}</p>
          </div>
        )}

        <div className="flex flex-col items-center justify-center rounded-xl border border-theme bg-surface-muted p-8">
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-theme">{t("preview")}</p>
          <FgsLogo size="lg" logoUrl={previewUrl} logoMode={previewMode} />
        </div>
      </div>

      <Button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving || uploading || (mode === "image" && !logoUrl.trim())}
        className="mt-6 cursor-pointer gap-1"
      >
        <Save className="h-4 w-4" />
        {saving ? t("saving") : t("save")}
      </Button>
    </div>
  );
}
