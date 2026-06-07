"use client";

import { useState } from "react";
import { UploadImage } from "@/components/ui/UploadImage";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";

interface ImageUrlsFieldProps {
  label: string;
  urls: string[];
  onChange: (urls: string[]) => void;
  hint?: string;
  objectFit?: "cover" | "contain";
}

export function ImageUrlsField({ label, urls, onChange, hint, objectFit = "contain" }: ImageUrlsFieldProps) {
  const [uploading, setUploading] = useState(false);

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;
    setUploading(true);
    const added: string[] = [];
    try {
      for (const file of list) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (res.ok && data.url) added.push(data.url as string);
      }
      if (added.length === 0) {
        showAdminErrorToast("Upload failed");
        return;
      }
      onChange([...urls, ...added]);
      showAdminSuccessToast(added.length > 1 ? `Added ${added.length} images` : "Image added");
    } catch {
      showAdminErrorToast("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-slate-50">
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const files = e.target.files;
              if (files?.length) void uploadFiles(files);
              e.target.value = "";
            }}
          />
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Upload images
        </label>
      </div>

      {urls.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {urls.map((url, index) => (
            <li key={`${url}-${index}`} className="rounded-lg border bg-slate-50 p-2">
              <div className="relative mb-2 flex min-h-[140px] items-center justify-center overflow-hidden rounded-md bg-white p-2">
                <UploadImage
                  src={url}
                  alt=""
                  width={480}
                  height={360}
                  className={objectFit === "contain" ? "h-auto max-h-36 w-full object-contain" : "h-36 w-full object-cover"}
                  sizes="240px"
                />
              </div>
              <div className="flex gap-2">
                <Input
                  className="text-xs"
                  value={url}
                  onChange={(e) => {
                    const next = [...urls];
                    next[index] = e.target.value;
                    onChange(next);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 cursor-pointer text-red-600"
                  onClick={() => onChange(urls.filter((_, i) => i !== index))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
