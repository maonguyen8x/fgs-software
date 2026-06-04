"use client";

import { useEffect } from "react";

const HERO_VIDEO_SELECTOR = "video.hero-slide-video";

/** Muted inline playback — retries help on first visit / incognito / Opera. */
export async function playHeroMutedVideo(video: HTMLVideoElement): Promise<boolean> {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");

  try {
    await video.play();
    return !video.paused;
  } catch {
    return false;
  }
}

export function bindHeroVideoAutoplay(video: HTMLVideoElement, enabled: boolean): () => void {
  if (!enabled) {
    video.pause();
    return () => undefined;
  }

  let cancelled = false;
  const attempt = () => {
    if (cancelled || video.paused === false) return;
    void playHeroMutedVideo(video);
  };

  attempt();
  video.addEventListener("loadedmetadata", attempt);
  video.addEventListener("loadeddata", attempt);
  video.addEventListener("canplay", attempt);

  return () => {
    cancelled = true;
    video.removeEventListener("loadedmetadata", attempt);
    video.removeEventListener("loadeddata", attempt);
    video.removeEventListener("canplay", attempt);
  };
}

function isNovaChatTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest("[data-nova-chat-root]"));
}

/** One user gesture unlocks autoplay for hero videos (not when interacting with Nova chat). */
export function useHeroAutoplayUnlock(): void {
  useEffect(() => {
    const unlock = (event: Event) => {
      if (isNovaChatTarget(event.target)) return;
      document.querySelectorAll<HTMLVideoElement>(HERO_VIDEO_SELECTOR).forEach((video) => {
        void playHeroMutedVideo(video);
      });
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
      document.removeEventListener("touchstart", unlock);
    };

    document.addEventListener("pointerdown", unlock, { passive: true });
    document.addEventListener("keydown", unlock, { passive: true });
    document.addEventListener("touchstart", unlock, { passive: true });

    return () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
      document.removeEventListener("touchstart", unlock);
    };
  }, []);
}
