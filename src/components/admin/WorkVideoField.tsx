"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { parseVideoUrl, type VideoSource } from "@/lib/video-embed";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";

interface WorkVideoFieldProps {
  videoUrl: string;
  videoSource: VideoSource | "";
  onChange: (url: string, source: VideoSource | "") => void;
  labels: {
    title: string;
    tabUpload: string;
    tabYoutube: string;
    tabDailymotion: string;
    urlPlaceholder: string;
    uploadHint: string;
    preview: string;
    remove: string;
  };
}

export function WorkVideoField({ videoUrl, videoSource, onChange, labels }: WorkVideoFieldProps) {
  const [mode, setMode] = useState<VideoSource | "none">(
    videoSource || (videoUrl ? "youtube" : "none")
  );
  const [linkInput, setLinkInput] = useState(
    videoSource === "youtube" || videoSource === "dailymotion" ? videoUrl : ""
  );
  const [uploading, setUploading] = useState(false);

  const parsed = useMemo(() => {
    if (!videoUrl) return null;
    if (videoSource === "upload") {
      return { source: "upload" as const, embedUrl: videoUrl, watchUrl: videoUrl };
    }
    return parseVideoUrl(videoUrl);
  }, [videoUrl, videoSource]);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      showAdminErrorToast("Invalid video file");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload/video", { method: "POST", body: formData });
      const data = (await res.json()) as { url?: string };
      if (!res.ok || !data.url) {
        showAdminErrorToast("Video upload failed");
        return;
      }
      onChange(data.url, "upload");
      setMode("upload");
      showAdminSuccessToast("Video uploaded");
    } catch {
      showAdminErrorToast("Video upload failed");
    } finally {
      setUploading(false);
    }
  };

  const applyLink = (source: "youtube" | "dailymotion") => {
    const parsedLink = parseVideoUrl(linkInput);
    if (!parsedLink || parsedLink.source !== source) {
      showAdminErrorToast("Invalid video link");
      return;
    }
    onChange(parsedLink.watchUrl, source);
    setMode(source);
  };

  const clearVideo = () => {
    onChange("", "");
    setLinkInput("");
    setMode("none");
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
      <Label className="text-base font-semibold text-heading">{labels.title}</Label>

      <div className="flex flex-wrap gap-2">
        {(["upload", "youtube", "dailymotion"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={cn(
              "cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              mode === tab
                ? "bg-primary-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-primary-50"
            )}
            onClick={() => setMode(tab)}
          >
            {tab === "upload" ? labels.tabUpload : tab === "youtube" ? labels.tabYoutube : labels.tabDailymotion}
          </button>
        ))}
      </div>

      {mode === "upload" && (
        <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary-200 bg-white p-6">
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadFile(file);
              e.target.value = "";
            }}
          />
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          ) : (
            <Upload className="h-8 w-8 text-primary-600" />
          )}
          <p className="mt-2 text-sm text-slate-600">{labels.uploadHint}</p>
        </label>
      )}

      {mode === "youtube" && (
        <div className="flex flex-wrap gap-2">
          <Input
            className="min-w-[240px] flex-1"
            placeholder={labels.urlPlaceholder}
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
          />
          <Button type="button" variant="outline" className="cursor-pointer" onClick={() => applyLink("youtube")}>
            Apply
          </Button>
        </div>
      )}

      {mode === "dailymotion" && (
        <div className="flex flex-wrap gap-2">
          <Input
            className="min-w-[240px] flex-1"
            placeholder={labels.urlPlaceholder}
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
          />
          <Button type="button" variant="outline" className="cursor-pointer" onClick={() => applyLink("dailymotion")}>
            Apply
          </Button>
        </div>
      )}

      {parsed && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{labels.preview}</p>
          <div className="relative aspect-video overflow-hidden rounded-xl bg-black ring-1 ring-slate-200">
            {parsed.source === "upload" ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video src={parsed.embedUrl} controls className="h-full w-full object-contain" />
            ) : (
              <iframe
                src={parsed.embedUrl}
                title="Video preview"
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
          <Button type="button" variant="outline" size="sm" className="cursor-pointer text-red-600" onClick={clearVideo}>
            <X className="mr-1 h-4 w-4" />
            {labels.remove}
          </Button>
        </div>
      )}
    </div>
  );
}
