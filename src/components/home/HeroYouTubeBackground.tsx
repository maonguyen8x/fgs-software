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

const IFRAME_REVEAL_MS = 480;

export function HeroYouTubeBackground({ videoId, posterUrl, alt, isActive }: HeroYouTubeBackgroundProps) {
  const mounted = useMounted();
  const [origin, setOrigin] = useState("");
  const [iframeReady, setIframeReady] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    setIframeReady(false);
  }, [isActive, videoId, origin]);

  const embedUrl = useMemo(
    () => buildYouTubeBackgroundEmbedUrl(videoId, origin || undefined),
    [videoId, origin]
  );

  const showIframe = mounted && isActive && !!origin;
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
        className={`hero-media-sharp hero-media-fill transition-opacity duration-700 ${
          showMotion ? "opacity-0" : "opacity-100"
        } ${posterAnimates ? "hero-ken-burns" : ""}`}
        sizes="100vw"
        unoptimized={posterUrl.startsWith("/") || posterUrl.includes("ytimg.com")}
        priority={isActive}
      />
      {showIframe && (
        <div className="hero-youtube-clip absolute inset-0 overflow-hidden" aria-hidden>
          <iframe
            key={`${videoId}-${origin}`}
            title={alt}
            src={embedUrl}
            className={`hero-youtube-iframe transition-opacity duration-700 ${
              showMotion ? "hero-youtube-iframe--live opacity-100" : "opacity-0"
            }`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen={false}
            referrerPolicy="strict-origin-when-cross-origin"
            loading="eager"
            tabIndex={-1}
            onLoad={handleIframeLoad}
          />
        </div>
      )}
      <div className="hero-media-ui-mask pointer-events-none absolute inset-0 z-3" aria-hidden />
    </div>
  );
}
