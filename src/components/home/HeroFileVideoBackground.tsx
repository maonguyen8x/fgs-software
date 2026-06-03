"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface HeroFileVideoBackgroundProps {
  src: string;
  posterUrl: string;
  alt: string;
  isActive: boolean;
}

/** File video without native play/seek UI — poster image until playback starts. */
export function HeroFileVideoBackground({ src, posterUrl, alt, isActive }: HeroFileVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const isLocalPoster = posterUrl.startsWith("/");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!isActive) {
      video.pause();
      setPlaying(false);
      return;
    }
    setPlaying(false);
    void video.play().catch(() => undefined);
  }, [isActive, src]);

  return (
    <div className="hero-file-video-wrap absolute inset-0 h-full w-full overflow-hidden">
      <Image
        src={posterUrl}
        alt={alt}
        fill
        quality={95}
        className={`hero-media-sharp object-cover object-center transition-opacity duration-700 ${
          playing ? "opacity-0" : "opacity-100"
        }`}
        sizes="100vw"
        unoptimized={isLocalPoster}
        priority={isActive}
      />
      <video
        ref={videoRef}
        className={`hero-media-sharp hero-slide-video absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 ${
          playing ? "opacity-100" : "opacity-0"
        }`}
        src={src}
        muted
        loop
        playsInline
        autoPlay={isActive}
        controls={false}
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        preload={isActive ? "auto" : "none"}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        aria-hidden
        tabIndex={-1}
      />
      <div className="hero-media-ui-mask pointer-events-none absolute inset-0 z-[2]" aria-hidden />
    </div>
  );
}
