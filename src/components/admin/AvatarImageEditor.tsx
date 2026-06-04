"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Upload, ZoomIn, ZoomOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";

interface AvatarImageEditorProps {
  value?: string | null;
  onChange: (url: string) => void;
}

const OUTPUT_SIZE = 512;
const CROP_SIZE = 320;
const PREVIEW_BOX = 360;

function inferMimeFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "";
}

function UploadDropZone({
  onSelect,
  onDropFile,
  hint,
  formats,
}: {
  onSelect: (file: File) => void;
  onDropFile: (file: File) => void;
  hint: string;
  formats: string;
}) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onSelect(file);
    event.target.value = "";
  };

  return (
    <div
      className={cn(
        "relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl",
        "border-2 border-dashed border-primary-200 bg-primary-50/50 p-8 transition-colors",
        "hover:border-primary-400 hover:bg-primary-50 dark:border-primary-800 dark:bg-primary-950/30"
      )}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const file = event.dataTransfer.files[0];
        if (file) onDropFile(file);
      }}
    >
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/jpg,.jpg,.jpeg,.png,.webp,.gif"
        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        onChange={handleChange}
      />
      <Upload className="pointer-events-none mb-2 h-8 w-8 text-primary-600" />
      <p className="pointer-events-none text-sm font-medium text-primary-700 dark:text-primary-300">{hint}</p>
      <p className="pointer-events-none mt-1 text-xs text-muted-theme">{formats}</p>
    </div>
  );
}

export function AvatarImageEditor({ value, onChange }: AvatarImageEditorProps) {
  const t = useTranslations("admin.founders.avatar_editor");
  const te = useTranslations("admin.founders.errors");
  const [preview, setPreview] = useState(value ?? "");
  const [source, setSource] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setPreview(value ?? "");
  }, [value]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const loadFile = useCallback(
    (file: File) => {
      const mime = file.type || inferMimeFromName(file.name);
      if (!mime.startsWith("image/")) {
        showAdminErrorToast(te("invalid_type"));
        return;
      }

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      const objectUrl = URL.createObjectURL(file);
      objectUrlRef.current = objectUrl;
      setSource(objectUrl);
      setScale(1);
      setOffset({ x: 0, y: 0 });
      setImageSize({ width: 0, height: 0 });
    },
    [te]
  );

  const clearSource = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setSource(null);
    setImageSize({ width: 0, height: 0 });
  };

  const handleSaveCrop = async () => {
    if (!source) return;
    if (imageSize.width <= 0 || imageSize.height <= 0) {
      showAdminErrorToast(te("image_not_ready"));
      return;
    }
    setUploading(true);
    try {
      const img = new Image();
      if (!source.startsWith("blob:") && !source.startsWith("data:")) {
        img.crossOrigin = "anonymous";
      }
      img.src = source;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("load"));
      });

      const canvas = document.createElement("canvas");
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("ctx");

      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const left = (CROP_SIZE - drawW) / 2 + offset.x;
      const top = (CROP_SIZE - drawH) / 2 + offset.y;
      const factor = OUTPUT_SIZE / CROP_SIZE;

      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
      ctx.drawImage(img, left * factor, top * factor, drawW * factor, drawH * factor);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((result) => resolve(result), "image/jpeg", 0.92)
      );
      if (!blob) throw new Error("blob");

      const formData = new FormData();
      formData.append("file", blob, "avatar.jpg");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
      });
      let data: { url?: string; code?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (!res.ok) {
        const code = data.code as string | undefined;
        if (code === "INVALID_TYPE") showAdminErrorToast(te("invalid_type"));
        else if (code === "FILE_TOO_LARGE") showAdminErrorToast(te("file_too_large"));
        else if (res.status === 401) showAdminErrorToast(te("unauthorized"));
        else showAdminErrorToast(te("upload_failed"));
        return;
      }

      const url = typeof data.url === "string" ? data.url.split("?")[0] : "";
      if (!url) {
        showAdminErrorToast(te("upload_failed"));
        return;
      }

      setPreview(`${url}?v=${Date.now()}`);
      onChange(url);
      clearSource();
      showAdminSuccessToast(t("uploaded"));
    } catch {
      showAdminErrorToast(te("upload_failed"));
    } finally {
      setUploading(false);
    }
  };

  const displayWidth = imageSize.width > 0 ? imageSize.width * scale : CROP_SIZE * scale;

  return (
    <div className="space-y-3">
      {preview && !source && (
        <div className="flex flex-wrap items-start gap-4">
          <div className="relative inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt=""
              className="h-36 w-36 rounded-2xl border border-theme bg-slate-50 object-contain p-1 dark:bg-slate-900"
            />
            <button
              type="button"
              className="absolute -right-2 -top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white shadow"
              onClick={() => {
                setPreview("");
                onChange("");
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/jpg,.jpg,.jpeg,.png,.webp,.gif"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              style={{ zIndex: 50 }}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) loadFile(file);
                event.target.value = "";
              }}
            />
            <Button type="button" variant="outline" className="relative">
              {t("change_photo")}
            </Button>
          </div>
        </div>
      )}

      {!source && !preview && (
        <UploadDropZone
          hint={t("drop_hint")}
          formats={t("formats")}
          onSelect={loadFile}
          onDropFile={loadFile}
        />
      )}

      {source && (
        <div className="rounded-xl border border-theme bg-surface-muted p-4">
          <p className="mb-2 text-sm font-medium text-heading">{t("preview_full")}</p>
          <div
            className="mx-auto mb-4 flex items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-950"
            style={{ width: PREVIEW_BOX, height: PREVIEW_BOX }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={source} alt="" className="max-h-full max-w-full object-contain" />
          </div>
          <p className="mb-3 text-sm font-medium text-heading">{t("crop_title")}</p>
          <div
            className="relative mx-auto cursor-grab overflow-hidden rounded-xl bg-slate-800 active:cursor-grabbing"
            style={{ width: CROP_SIZE, height: CROP_SIZE }}
            onMouseDown={(event) => {
              setDragging(true);
              dragStart.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
            }}
            onMouseMove={(event) => {
              if (!dragging) return;
              setOffset({
                x: dragStart.current.ox + (event.clientX - dragStart.current.x),
                y: dragStart.current.oy + (event.clientY - dragStart.current.y),
              });
            }}
            onMouseUp={() => setDragging(false)}
            onMouseLeave={() => setDragging(false)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={source}
              alt=""
              draggable={false}
              onLoad={(event) => {
                const { naturalWidth, naturalHeight } = event.currentTarget;
                setImageSize({ width: naturalWidth, height: naturalHeight });
                const fitScale = Math.min(CROP_SIZE / naturalWidth, CROP_SIZE / naturalHeight);
                setScale(fitScale);
                setOffset({ x: 0, y: 0 });
              }}
              className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
              style={{
                width: displayWidth,
                height: "auto",
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
              }}
            />
            <div className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-white/90" />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" size="sm" className="cursor-pointer" onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.05}
              value={scale}
              onChange={(event) => setScale(parseFloat(event.target.value))}
              className="h-2 flex-1 cursor-pointer accent-primary-600"
            />
            <Button type="button" variant="outline" size="sm" className="cursor-pointer" onClick={() => setScale((s) => Math.min(3, s + 0.1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4 flex gap-2">
            <Button type="button" variant="outline" className="cursor-pointer" onClick={clearSource}>
              {t("cancel")}
            </Button>
            <Button type="button" className="cursor-pointer" disabled={uploading} onClick={handleSaveCrop}>
              {uploading ? t("uploading") : t("apply")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
