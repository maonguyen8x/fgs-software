"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { buildYouTubeBackgroundEmbedUrl } from "@/lib/youtube";
import { useMounted } from "@/hooks/use-mounted";

interface HeroYouTubeBackgroundProps {
  videoId: string;
  posterUrl: string;
  alt: string;
  isActive: boolean;
}

const IFRAME_REVEAL_MS = 2200;
const IFRAME_MOUNT_DELAY_MS = 280;

export function HeroYouTubeBackground({ videoId, posterUrl, alt, isActive }: HeroYouTubeBackgroundProps) {
  const mounted = useMounted();
  const [origin, setOrigin] = useState("");
  const [iframeReady, setIframeReady] = useState(false);
  const [iframeMounted, setIframeMounted] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    setIframeReady(false);
    setIframeMounted(false);
  }, [isActive, videoId, origin]);

  useEffect(() => {
    if (!mounted || !isActive || !origin) {
      setIframeMounted(false);
      return;
    }

    const timer = window.setTimeout(() => setIframeMounted(true), IFRAME_MOUNT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [mounted, isActive, origin, videoId]);

  const embedUrl = useMemo(
    () => buildYouTubeBackgroundEmbedUrl(videoId, origin || undefined),
    [videoId, origin]
  );

  const showIframe = iframeMounted && isActive && !!origin;
  const showMotion = showIframe && iframeReady;
  const posterAnimates = isActive && !showMotion;

  const handleIframeLoad = () => {
    window.setTimeout(() => setIframeReady(true), IFRAME_REVEAL_MS);
  };

  return (
    <div className="hero-youtube-wrap absolute inset-0 h-full w-full overflow-hidden">
      <Image
        src={posterUrl}
        alt={alt}
        fill
        quality={95}
        className={`hero-media-sharp hero-media-fill hero-media-poster-cover transition-opacity duration-700 ${
          showMotion ? "opacity-0" : "opacity-100"
        } ${posterAnimates ? "hero-ken-burns" : ""}`}
        sizes="100vw"
        unoptimized={posterUrl.startsWith("/") || posterUrl.includes("ytimg.com")}
        priority={isActive}
      />
      {showIframe && (
        <div
          className={`hero-youtube-clip absolute inset-0 overflow-hidden ${
            showMotion ? "hero-youtube-clip--live" : ""
          }`}
          aria-hidden
        >
          <iframe
            key={`${videoId}-${origin}`}
            title={alt}
            src={embedUrl}
            className="hero-youtube-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen={false}
            referrerPolicy="strict-origin-when-cross-origin"
            loading="eager"
            tabIndex={-1}
            onLoad={handleIframeLoad}
          />
        </div>
      )}
    </div>
  );
}
