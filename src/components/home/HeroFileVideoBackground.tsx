"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { bindHeroVideoAutoplay } from "@/lib/hero-media-autoplay";
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
  const [motionVisible, setMotionVisible] = useState(false);
  const isLocalPoster = posterUrl.startsWith("/");
  const showVideo = mounted && isActive;

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
    };
    const onPlaying = () => setMotionVisible(true);
    const onPause = () => {
      if (video.currentTime < 0.04) setMotionVisible(false);
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onPause);

    const unbindAutoplay = bindHeroVideoAutoplay(video, true);

    return () => {
      unbindAutoplay();
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
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
        className={`hero-media-sharp hero-media-fill transition-opacity duration-700 ${
          motionVisible ? "opacity-0" : "opacity-100"
        } ${posterAnimates ? "hero-ken-burns" : ""}`}
        sizes="100vw"
        unoptimized={isLocalPoster}
        priority={isActive}
      />
      {showVideo && (
        <video
          ref={videoRef}
          className={`hero-media-sharp hero-slide-video hero-media-fill transition-opacity duration-700 ${
            motionVisible ? "hero-slide-video--live opacity-100" : "opacity-0"
          }`}
          src={src}
          muted
          loop
          playsInline
          controls={false}
          controlsList="nodownload nofullscreen noremoteplayback"
          disablePictureInPicture
          disableRemotePlayback
          preload="auto"
          aria-hidden
          tabIndex={-1}
        />
      )}
      <div className="hero-media-ui-mask pointer-events-none absolute inset-0 z-2" aria-hidden />
    </div>
  );
}
