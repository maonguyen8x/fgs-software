"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { buildYouTubeBackgroundEmbedUrl } from "@/lib/youtube";
import {
  loadYouTubeIframeApi,
  registerHeroYouTubePlayer,
  type YouTubePlayer,
} from "@/lib/youtube-iframe-api";
import { useMounted } from "@/hooks/use-mounted";

interface HeroYouTubeBackgroundProps {
  videoId: string;
  posterUrl: string;
  alt: string;
  isActive: boolean;
}

const KEEP_ALIVE_MS = 500;

export function HeroYouTubeBackground({ videoId, posterUrl, alt, isActive }: HeroYouTubeBackgroundProps) {
  const mounted = useMounted();
  const frameId = useId().replace(/:/g, "");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const unregisterRef = useRef<(() => void) | null>(null);
  const isActiveRef = useRef(isActive);
  const [origin, setOrigin] = useState("");
  const [playing, setPlaying] = useState(false);
  const [iframeMounted, setIframeMounted] = useState(false);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    setPlaying(false);
    setIframeMounted(false);
  }, [isActive, videoId, origin]);

  useEffect(() => {
    if (!mounted || !isActive || !origin) {
      setIframeMounted(false);
      return;
    }

    const timer = window.setTimeout(() => setIframeMounted(true), 80);
    return () => window.clearTimeout(timer);
  }, [mounted, isActive, origin, videoId]);

  const destroyPlayer = useCallback(() => {
    unregisterRef.current?.();
    unregisterRef.current = null;
    try {
      playerRef.current?.destroy();
    } catch {
      /* ignore */
    }
    playerRef.current = null;
  }, []);

  const bindPlayer = useCallback(async () => {
    const iframe = iframeRef.current;
    if (!iframe || !isActiveRef.current) return;

    const YT = await loadYouTubeIframeApi();
    destroyPlayer();

    const player = new YT.Player(iframe, {
      events: {
        onReady: (event) => {
          event.target.mute();
          event.target.playVideo();
        },
        onStateChange: (event) => {
          const { data, target } = event;

          if (data === YT.PlayerState.PLAYING) {
            setPlaying(true);
          }

          if (data === YT.PlayerState.ENDED) {
            target.seekTo(0, true);
            target.playVideo();
          }

          if (data === YT.PlayerState.PAUSED && isActiveRef.current) {
            window.setTimeout(() => {
              try {
                if (playerRef.current?.getPlayerState() === YT.PlayerState.PAUSED) {
                  playerRef.current.playVideo();
                }
              } catch {
                /* ignore */
              }
            }, 100);
          }
        },
      },
    });

    playerRef.current = player;
    unregisterRef.current = registerHeroYouTubePlayer(player);
  }, [destroyPlayer]);

  useEffect(() => {
    if (!iframeMounted || !isActive || !origin) return;

    let cancelled = false;
    let keepAliveTimer: number | undefined;

    const onIframeLoad = () => {
      if (cancelled) return;
      void bindPlayer().catch(() => {
        /* poster remains visible */
      });
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener("load", onIframeLoad);
    }

    keepAliveTimer = window.setInterval(() => {
      if (!playerRef.current || cancelled) return;
      try {
        const YT = window.YT;
        if (!YT) return;
        const state = playerRef.current.getPlayerState();
        if (state === YT.PlayerState.ENDED) {
          playerRef.current.seekTo(0, true);
          playerRef.current.playVideo();
        } else if (state === YT.PlayerState.PAUSED && isActiveRef.current) {
          playerRef.current.playVideo();
        }
      } catch {
        /* ignore */
      }
    }, KEEP_ALIVE_MS);

    return () => {
      cancelled = true;
      iframe?.removeEventListener("load", onIframeLoad);
      if (keepAliveTimer) window.clearInterval(keepAliveTimer);
      destroyPlayer();
      setPlaying(false);
    };
  }, [iframeMounted, isActive, origin, videoId, bindPlayer, destroyPlayer]);

  const embedUrl = origin ? buildYouTubeBackgroundEmbedUrl(videoId, origin) : "";
  const showMotion = iframeMounted && isActive && playing;
  const posterAnimates = isActive && !showMotion;

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

      {iframeMounted && isActive && embedUrl && (
        <div
          className={`hero-youtube-clip absolute inset-0 overflow-hidden ${
            showMotion ? "hero-youtube-clip--live" : ""
          }`}
          aria-hidden
        >
          <iframe
            ref={iframeRef}
            key={`${videoId}-${origin}`}
            id={frameId}
            title=""
            src={embedUrl}
            className="hero-youtube-iframe"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen={false}
            referrerPolicy="strict-origin-when-cross-origin"
            loading="eager"
            tabIndex={-1}
          />
        </div>
      )}
    </div>
  );
}
