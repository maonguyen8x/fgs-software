"use client";

import { useState } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { UploadImage } from "@/components/ui/UploadImage";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
}

export function ImageUploadField({ value, onChange, label, hint }: ImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const preview = value?.split("?")[0] ?? "";

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = (await res.json()) as { url?: string; code?: string };
      if (!res.ok || !data.url) {
        showAdminErrorToast("Upload failed");
        return;
      }
      onChange(data.url);
      showAdminSuccessToast("Image uploaded");
    } catch {
      showAdminErrorToast("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label ? <p className="text-sm font-medium text-heading">{label}</p> : null}
      {preview ? (
        <div className="relative inline-block overflow-hidden rounded-xl">
          <div className="relative h-40 w-64">
            <UploadImage src={preview} alt="" fill className="object-cover" />
          </div>
          <button
            type="button"
            className="absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white shadow"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          className={cn(
            "flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary-200 bg-primary-50/40 p-6 transition-colors hover:border-primary-400"
          )}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
              e.target.value = "";
            }}
          />
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          ) : (
            <Upload className="h-8 w-8 text-primary-600" />
          )}
          <p className="mt-2 text-sm font-medium text-primary-700">Click or drag to upload</p>
        </label>
      )}
      {preview && (
        <label className="inline-flex cursor-pointer rounded-lg border border-theme px-3 py-1.5 text-sm font-medium hover:bg-surface-muted">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
              e.target.value = "";
            }}
          />
          Change image
        </label>
      )}
      {hint ? <p className="text-xs text-muted-theme">{hint}</p> : null}
    </div>
  );
}
