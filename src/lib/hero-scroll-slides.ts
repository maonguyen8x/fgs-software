import { isYouTubeUrl, parseYouTubeVideoId } from "@/lib/youtube";

export type HeroMediaType = "image" | "video" | "youtube";

export interface HeroScrollSlideItem {
  id: string;
  mediaType: HeroMediaType;
  imageUrl: string;
  videoUrl?: string | null;
  alt: string;
  title?: string | null;
  titleJa?: string | null;
  titleVi?: string | null;
}

/** Đà Nẵng về đêm — mặc định khi chưa có slide trong DB (video nền, không UI player). */
export const DEFAULT_HERO_SCROLL_SLIDES: HeroScrollSlideItem[] = [
  {
    id: "default-danang-dragon",
    mediaType: "video",
    imageUrl: "/images/hero-bridge-night.jpg",
    videoUrl: "https://assets.mixkit.co/videos/4087/4087-720.mp4",
    alt: "Cầu Rồng Đà Nẵng về đêm",
    title: "Cầu Rồng",
  },
  {
    id: "default-danang-tran-thi-ly",
    mediaType: "video",
    imageUrl: "/images/hero-city-traffic.jpg",
    videoUrl: "https://assets.mixkit.co/videos/11/11-720.mp4",
    alt: "Cầu Trần Thị Lý Đà Nẵng về đêm",
    title: "Cầu Trần Thị Lý",
  },
  {
    id: "default-danang-song-han",
    mediaType: "video",
    imageUrl: "/images/hero-city-aerial.jpg",
    videoUrl: "https://assets.mixkit.co/videos/42342/42342-720.mp4",
    alt: "Cầu Sông Hàn Đà Nẵng về đêm",
    title: "Cầu Sông Hàn",
  },
];

export function resolveHeroScrollSlides(
  rows: Array<{
    id: string;
    mediaType?: string | null;
    imageUrl: string;
    videoUrl?: string | null;
    alt: string;
    title?: string | null;
    titleJa?: string | null;
    titleVi?: string | null;
  }>
): HeroScrollSlideItem[] {
  if (rows.length === 0) return DEFAULT_HERO_SCROLL_SLIDES;
  return rows.map((r) => {
    let mediaType: HeroMediaType = "image";
    if (r.videoUrl && (r.mediaType === "youtube" || isYouTubeUrl(r.videoUrl))) {
      mediaType = parseYouTubeVideoId(r.videoUrl) ? "youtube" : "image";
    } else if (r.mediaType === "video" && r.videoUrl) {
      mediaType = "video";
    }
    return {
      id: r.id,
      mediaType,
      imageUrl: r.imageUrl,
      videoUrl: r.videoUrl,
      alt: r.alt || "Đà Nẵng về đêm",
      title: r.title,
      titleJa: r.titleJa,
      titleVi: r.titleVi,
    };
  });
}
