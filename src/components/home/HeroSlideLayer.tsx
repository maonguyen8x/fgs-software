"use client";

import Image from "next/image";
import { HeroYouTubeBackground } from "@/components/home/HeroYouTubeBackground";
import { HeroFileVideoBackground } from "@/components/home/HeroFileVideoBackground";
import { parseYouTubeVideoId } from "@/lib/youtube";
import type { HeroScrollSlideItem } from "@/lib/hero-scroll-slides";

interface HeroSlideLayerProps {
  slide: HeroScrollSlideItem;
  isActive: boolean;
  offset: number;
}

export function HeroSlideLayer({ slide, isActive, offset }: HeroSlideLayerProps) {
  const isLocal = (url: string) => url.startsWith("/");
  const isFileVideo = slide.mediaType === "video" && !!slide.videoUrl;
  const youtubeId =
    slide.mediaType === "youtube" && slide.videoUrl
      ? parseYouTubeVideoId(slide.videoUrl)
      : null;
  const active = isActive && Math.abs(offset) < 0.35;

  if (youtubeId) {
    return (
      <HeroYouTubeBackground
        videoId={youtubeId}
        posterUrl={slide.imageUrl}
        alt={slide.alt}
        isActive={active}
      />
    );
  }

  if (isFileVideo) {
    return (
      <HeroFileVideoBackground
        src={slide.videoUrl!}
        posterUrl={slide.imageUrl}
        alt={slide.alt}
        isActive={active}
      />
    );
  }

  return (
    <Image
      src={slide.imageUrl}
      alt={slide.alt}
      fill
      quality={95}
      className={`hero-media-sharp hero-media-fill ${isActive ? "hero-ken-burns" : ""}`}
      sizes="100vw"
      priority={isActive}
      unoptimized={isLocal(slide.imageUrl)}
    />
  );
}
