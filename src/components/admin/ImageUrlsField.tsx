"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";

interface ImageUrlsFieldProps {
  label: string;
  urls: string[];
  onChange: (urls: string[]) => void;
}

export function ImageUrlsField({ label, urls, onChange }: ImageUrlsFieldProps) {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) {
        showAdminErrorToast("Upload failed");
        return;
      }
      onChange([...urls, data.url as string]);
      showAdminSuccessToast("Image added");
    } catch {
      showAdminErrorToast("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-slate-50">
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadFile(file);
              e.target.value = "";
            }}
          />
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Upload image
        </label>
      </div>

      {urls.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {urls.map((url, index) => (
            <li key={`${url}-${index}`} className="rounded-lg border bg-slate-50 p-2">
              <div className="relative mb-2 aspect-video overflow-hidden rounded-md bg-white">
                <Image src={url} alt="" fill className="object-cover" sizes="240px" unoptimized />
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
