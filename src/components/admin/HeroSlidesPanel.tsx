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
  Film,
  ImageIcon,
  Link2,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { getYouTubeThumbnail, parseYouTubeVideoId } from "@/lib/youtube";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";
import { publishPublicSiteUpdate } from "@/lib/admin-public-sync";

const DEFAULT_VIDEO_POSTER =
  "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&h=1080&fit=crop&q=85";

interface HeroSlideRow {
  id: string;
  mediaType: string;
  imageUrl: string;
  videoUrl: string | null;
  alt: string;
  title: string | null;
  order: number;
  isVisible: boolean;
}

export function HeroSlidesPanel() {
  const t = useTranslations("admin.settings.hero_slides");
  const router = useRouter();
  const [slides, setSlides] = useState<HeroSlideRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [addingYoutube, setAddingYoutube] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadSlides = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/hero-slides");
      if (!res.ok) throw new Error("fetch");
      const data = (await res.json()) as HeroSlideRow[];
      setSlides(data);
    } catch {
      showAdminErrorToast(t("load_failed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadSlides();
  }, [loadSlides]);

  const uploadFile = async (file: File, endpoint: "/api/admin/upload" | "/api/admin/upload/video") => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(endpoint, { method: "POST", body: formData });
    return (await res.json()) as { url?: string; code?: string };
  };

  const handleUploadError = (code?: string, isVideo = false) => {
    if (code === "INVALID_TYPE") {
      showAdminErrorToast(isVideo ? t("error_invalid_video_type") : t("error_invalid_type"));
    } else if (code === "FILE_TOO_LARGE") {
      showAdminErrorToast(isVideo ? t("error_video_too_large") : t("error_too_large"));
    } else {
      showAdminErrorToast(isVideo ? t("upload_video_failed") : t("upload_failed"));
    }
  };

  const createSlide = async (body: Record<string, unknown>) => {
    const res = await fetch("/api/admin/hero-slides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      showAdminErrorToast(t("create_failed"));
      return false;
    }
    showAdminSuccessToast(t("upload_success"));
    await loadSlides();
    publishPublicSiteUpdate(router);
    return true;
  };

  const onImageInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingImage(true);
    try {
      const data = await uploadFile(file, "/api/admin/upload");
      if (!data.url) {
        handleUploadError(data.code, false);
        return;
      }
      await createSlide({
        mediaType: "image",
        imageUrl: data.url,
        alt: file.name.replace(/\.[^.]+$/, ""),
        isVisible: true,
      });
    } catch {
      showAdminErrorToast(t("upload_failed"));
    } finally {
      setUploadingImage(false);
    }
  };

  const addYoutubeSlide = async () => {
    const url = youtubeUrl.trim();
    if (!url) return;
    const videoId = parseYouTubeVideoId(url);
    if (!videoId) {
      showAdminErrorToast(t("error_invalid_youtube"));
      return;
    }
    setAddingYoutube(true);
    try {
      const ok = await createSlide({
        mediaType: "youtube",
        videoUrl: url,
        imageUrl: getYouTubeThumbnail(videoId),
        alt: t("youtube_default_alt"),
        isVisible: true,
      });
      if (ok) setYoutubeUrl("");
    } finally {
      setAddingYoutube(false);
    }
  };

  const onVideoInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingVideo(true);
    try {
      const data = await uploadFile(file, "/api/admin/upload/video");
      if (!data.url) {
        handleUploadError(data.code, true);
        return;
      }
      await createSlide({
        mediaType: "video",
        imageUrl: DEFAULT_VIDEO_POSTER,
        videoUrl: data.url,
        alt: file.name.replace(/\.[^.]+$/, ""),
        isVisible: true,
      });
    } catch {
      showAdminErrorToast(t("upload_video_failed"));
    } finally {
      setUploadingVideo(false);
    }
  };

  const onPosterInput = async (slideId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setSavingId(slideId);
    try {
      const data = await uploadFile(file, "/api/admin/upload");
      if (!data.url) {
        handleUploadError(data.code, false);
        return;
      }
      await updateSlide(slideId, { imageUrl: data.url });
    } finally {
      setSavingId(null);
    }
  };

  const updateSlide = async (id: string, patch: Partial<HeroSlideRow>) => {
    setSavingId(id);
    const res = await fetch(`/api/admin/hero-slides/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSavingId(null);
    if (!res.ok) {
      showAdminErrorToast(t("save_failed"));
      return;
    }
    showAdminSuccessToast(t("save_success"));
    await loadSlides();
    publishPublicSiteUpdate(router);
  };

  const deleteSlide = async (id: string) => {
    if (!confirm(t("delete_confirm"))) return;
    const res = await fetch(`/api/admin/hero-slides/${id}`, { method: "DELETE" });
    if (!res.ok) {
      showAdminErrorToast(t("delete_failed"));
      return;
    }
    showAdminSuccessToast(t("delete_success"));
    await loadSlides();
    publishPublicSiteUpdate(router);
  };

  const moveSlide = async (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= slides.length) return;
    const ordered = [...slides];
    const [item] = ordered.splice(index, 1);
    ordered.splice(next, 0, item);
    setSlides(ordered);
    const res = await fetch("/api/admin/hero-slides", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: ordered.map((s) => s.id) }),
    });
    if (!res.ok) {
      showAdminErrorToast(t("reorder_failed"));
      await loadSlides();
      return;
    }
    publishPublicSiteUpdate(router);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{t("title")}</h2>
        <p className="mt-1 text-sm text-slate-600">{t("subtitle")}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
        <Label htmlFor="hero-youtube-url">{t("youtube_url_label")}</Label>
        <p className="mt-1 text-xs text-slate-500">{t("youtube_url_hint")}</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="hero-youtube-url"
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder={t("youtube_url_placeholder")}
              className="pl-9"
              disabled={addingYoutube}
            />
          </div>
          <Button
            type="button"
            className="shrink-0 cursor-pointer"
            disabled={addingYoutube || !youtubeUrl.trim()}
            onClick={() => void addYoutubeSlide()}
          >
            {addingYoutube ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                {t("youtube_add")}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 transition hover:border-primary-300 hover:bg-primary-50/30">
          <input
            type="file"
            accept="video/mp4,video/webm"
            className="sr-only"
            disabled={uploadingVideo}
            onChange={onVideoInput}
          />
          {uploadingVideo ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          ) : (
            <>
              <Film className="h-8 w-8 text-slate-400" />
              <span className="mt-2 text-center text-sm font-medium text-slate-700">{t("drop_video_hint")}</span>
              <span className="mt-1 text-center text-xs text-slate-500">{t("video_formats")}</span>
            </>
          )}
        </label>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 px-4 py-8 transition hover:border-primary-300 hover:bg-primary-50/30">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="sr-only"
            disabled={uploadingImage}
            onChange={onImageInput}
          />
          {uploadingImage ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-slate-400" />
              <span className="mt-2 text-center text-sm font-medium text-slate-700">{t("drop_image_hint")}</span>
              <span className="mt-1 text-center text-xs text-slate-500">{t("formats")}</span>
            </>
          )}
        </label>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">{t("loading")}</p>
      ) : slides.length === 0 ? (
        <p className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
          {t("empty")}
        </p>
      ) : (
        <ul className="space-y-4">
          {slides.map((slide, index) => (
            <li
              key={slide.id}
              className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-white p-4 sm:flex-row sm:items-start"
            >
              <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-lg bg-slate-900">
                {slide.mediaType === "video" && slide.videoUrl ? (
                  <video
                    src={slide.videoUrl}
                    poster={slide.imageUrl}
                    muted
                    playsInline
                    controls={false}
                    className="h-full w-full object-cover pointer-events-none"
                  />
                ) : (
                  <Image
                    src={slide.imageUrl}
                    alt={slide.alt}
                    fill
                    className="object-cover"
                    unoptimized={
                      slide.imageUrl.startsWith("/") || slide.imageUrl.includes("ytimg.com")
                    }
                  />
                )}
                {slide.mediaType === "youtube" && (
                  <span className="absolute right-1 top-1 rounded bg-red-600/90 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    YT
                  </span>
                )}
                {slide.mediaType === "video" && (
                  <span className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                    MP4
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor={`alt-${slide.id}`}>{t("alt_label")}</Label>
                    <Input
                      id={`alt-${slide.id}`}
                      defaultValue={slide.alt}
                      className="mt-1"
                      onBlur={(e) => {
                        if (e.target.value !== slide.alt) {
                          void updateSlide(slide.id, { alt: e.target.value });
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`title-${slide.id}`}>{t("title_label")}</Label>
                    <Input
                      id={`title-${slide.id}`}
                      defaultValue={slide.title ?? ""}
                      className="mt-1"
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v !== (slide.title ?? "")) {
                          void updateSlide(slide.id, { title: v || undefined });
                        }
                      }}
                    />
                  </div>
                </div>
                {slide.mediaType === "youtube" && (
                  <div>
                    <Label htmlFor={`yt-${slide.id}`}>{t("youtube_url_label")}</Label>
                    <Input
                      id={`yt-${slide.id}`}
                      defaultValue={slide.videoUrl ?? ""}
                      className="mt-1"
                      placeholder={t("youtube_url_placeholder")}
                      onBlur={(e) => {
                        const url = e.target.value.trim();
                        if (!url || url === (slide.videoUrl ?? "")) return;
                        const videoId = parseYouTubeVideoId(url);
                        if (!videoId) {
                          showAdminErrorToast(t("error_invalid_youtube"));
                          return;
                        }
                        void updateSlide(slide.id, {
                          mediaType: "youtube",
                          videoUrl: url,
                          imageUrl: getYouTubeThumbnail(videoId),
                        });
                      }}
                    />
                  </div>
                )}
                {(slide.mediaType === "video" || slide.mediaType === "youtube") && (
                  <div>
                    <Label className="text-xs text-slate-500">{t("poster_label")}</Label>
                    <label className="mt-1 inline-flex cursor-pointer items-center gap-2 text-sm text-primary-700 hover:underline">
                      <Upload className="h-4 w-4" />
                      {t("poster_upload")}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="sr-only"
                        disabled={savingId === slide.id}
                        onChange={(e) => void onPosterInput(slide.id, e)}
                      />
                    </label>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index === 0 || savingId === slide.id}
                    onClick={() => void moveSlide(index, -1)}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index === slides.length - 1 || savingId === slide.id}
                    onClick={() => void moveSlide(index, 1)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void updateSlide(slide.id, { isVisible: !slide.isVisible })}
                  >
                    {slide.isVisible ? (
                      <>
                        <Eye className="mr-1 h-4 w-4" />
                        {t("visible")}
                      </>
                    ) : (
                      <>
                        <EyeOff className="mr-1 h-4 w-4" />
                        {t("hidden")}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => void deleteSlide(slide.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-slate-500">{t("hint_scroll")}</p>
    </div>
  );
}
