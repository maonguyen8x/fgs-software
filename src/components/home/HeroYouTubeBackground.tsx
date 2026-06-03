"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { buildYouTubeBackgroundEmbedUrl } from "@/lib/youtube";

interface HeroYouTubeBackgroundProps {
  videoId: string;
  posterUrl: string;
  alt: string;
  isActive: boolean;
}

export function HeroYouTubeBackground({ videoId, posterUrl, alt, isActive }: HeroYouTubeBackgroundProps) {
  const embedUrl = buildYouTubeBackgroundEmbedUrl(videoId);
  const [iframeReady, setIframeReady] = useState(false);
  const showMotion = isActive && iframeReady;

  useEffect(() => {
    if (!isActive) setIframeReady(false);
  }, [isActive]);

  return (
    <div className="hero-youtube-wrap absolute inset-0 h-full w-full overflow-hidden">
      <Image
        src={posterUrl}
        alt={alt}
        fill
        quality={95}
        className={`hero-media-sharp object-cover object-center transition-opacity duration-700 ${
          showMotion ? "opacity-0" : "opacity-100"
        }`}
        sizes="100vw"
        unoptimized={posterUrl.startsWith("/") || posterUrl.includes("ytimg.com")}
        priority={isActive}
      />
      {isActive && (
        <div className="hero-youtube-clip absolute inset-0 overflow-hidden" aria-hidden>
          <iframe
            title={alt}
            src={embedUrl}
            className={`hero-youtube-iframe transition-opacity duration-700 ${
              showMotion ? "opacity-100" : "opacity-0"
            }`}
            allow="accelerometer; autoplay; encrypted-media; gyroscope"
            allowFullScreen={false}
            referrerPolicy="strict-origin-when-cross-origin"
            tabIndex={-1}
            onLoad={() => setIframeReady(true)}
          />
        </div>
      )}
      <div className="hero-media-ui-mask pointer-events-none absolute inset-0 z-[3]" aria-hidden />
    </div>
  );
}
