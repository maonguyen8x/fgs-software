"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { bindHeroVideoAutoplay } from "@/lib/hero-media-autoplay";
import {
  dispatchHeroVideoLoopReset,
  dispatchHeroVideoNearEnd,
  HERO_BRAND_TRIGGER_BEFORE_END_SEC,
} from "@/lib/hero-video-events";
import { useMounted } from "@/hooks/use-mounted";

interface HeroFileVideoBackgroundProps {
  src: string;
  posterUrl: string;
  alt: string;
  isActive: boolean;
}

/** File video without native play/seek UI — poster until frames advance; Ken Burns if autoplay blocked. */
export function HeroFileVideoBackground({ src, posterUrl, alt, isActive }: HeroFileVideoBackgroundProps) {
  const mounted = useMounted();
  const videoRef = useRef<HTMLVideoElement>(null);
  const brandFiredRef = useRef(false);
  const [motionVisible, setMotionVisible] = useState(false);
  const [videoMounted, setVideoMounted] = useState(false);
  const isLocalPoster = posterUrl.startsWith("/");
  const showVideo = mounted && isActive && videoMounted;

  useEffect(() => {
    if (!mounted || !isActive) {
      setVideoMounted(false);
      setMotionVisible(false);
      return;
    }

    const timer = window.setTimeout(() => setVideoMounted(true), 180);
    return () => window.clearTimeout(timer);
  }, [mounted, isActive, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !showVideo) {
      setMotionVisible(false);
      return;
    }

    const onTimeUpdate = () => {
      if (video.currentTime > 0.04 && !video.paused) {
        setMotionVisible(true);
      }

      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;

      if (video.currentTime < 1.2) {
        brandFiredRef.current = false;
      }

      const remaining = duration - video.currentTime;
      const triggerAt = Math.max(duration - HERO_BRAND_TRIGGER_BEFORE_END_SEC, duration * 0.82);
      if (!brandFiredRef.current && video.currentTime >= triggerAt && remaining > 0.2) {
        brandFiredRef.current = true;
        dispatchHeroVideoNearEnd();
      }
    };
    const onPlaying = () => setMotionVisible(true);
    const onPause = () => {
      if (video.currentTime < 0.04) setMotionVisible(false);
    };
    const onEnded = () => {
      dispatchHeroVideoLoopReset();
      brandFiredRef.current = false;
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);

    video.controls = false;
    video.removeAttribute("controls");

    const unbindAutoplay = bindHeroVideoAutoplay(video, true);

    return () => {
      unbindAutoplay();
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, [showVideo, src]);

  const posterAnimates = isActive && !motionVisible;

  return (
    <div className="hero-file-video-wrap absolute inset-0 h-full w-full overflow-hidden">
      <Image
        src={posterUrl}
        alt={alt}
        fill
        quality={95}
        className={`hero-media-sharp hero-media-fill hero-media-poster-cover transition-opacity duration-700 ${
          motionVisible ? "opacity-0" : "opacity-100"
        } ${posterAnimates ? "hero-ken-burns" : ""}`}
        sizes="100vw"
        unoptimized={isLocalPoster}
        priority={isActive}
      />
      {showVideo && (
        <div
          className={`hero-file-video-player absolute inset-0 overflow-hidden ${
            motionVisible ? "hero-file-video-player--live" : ""
          }`}
          aria-hidden
        >
          <video
            ref={videoRef}
            className="hero-media-sharp hero-slide-video hero-media-fill"
            src={src}
            muted
            loop
            playsInline
            controls={false}
            controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
            disablePictureInPicture
            disableRemotePlayback
            poster={posterUrl}
            preload="metadata"
            aria-hidden
            tabIndex={-1}
          />
        </div>
      )}
    </div>
  );
}
