"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { BRAND } from "@/config/brand";
import { FgsLogo } from "@/components/brand/FgsLogo";
import { shouldUseUnoptimizedImage } from "@/lib/upload-url";
import type { LogoDisplayMode } from "@/lib/brand-logo";

interface IntroLogoArtworkProps {
  logoUrl?: string | null;
  logoMode?: LogoDisplayMode;
}

export function IntroLogoArtwork({ logoUrl, logoMode = "image" }: IntroLogoArtworkProps) {
  if (logoMode !== "image") {
    return <FgsLogo size="lg" logoMode="text" />;
  }

  const src = logoUrl?.trim() || BRAND.logoPath;
  if (src.split("?")[0] === BRAND.logoPath) {
    return (
      <span className="intro-logo-art-stage" role="img" aria-label={BRAND.logoAlt}>
        {["blue", "orange", "green", "software"].map((part) => (
          <Image
            key={part}
            src={src}
            alt=""
            width={470}
            height={220}
            className={`intro-logo-art-image intro-logo-art-image--${part}`}
            unoptimized
          />
        ))}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={BRAND.logoAlt}
      width={470}
      height={220}
      className="intro-logo-art-image intro-logo-art-image--custom"
      unoptimized={shouldUseUnoptimizedImage(src) || src === BRAND.logoPath}
    />
  );
}

export function IntroLogoPreview({ logoUrl, logoMode }: IntroLogoArtworkProps) {
  return (
    <div className="intro-logo-preview">
      <div className="intro-logo-lockup">
        <IntroLogoArtwork logoUrl={logoUrl} logoMode={logoMode} />
      </div>
    </div>
  );
}

export function IntroLogoLoader({ logoUrl, logoMode }: IntroLogoArtworkProps) {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const leaveAt = 2;
  const hideAt = 2.25;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(false);
      return;
    }

    try {
      if (window.sessionStorage.getItem("fgs-logo-intro-seen-v4")) {
        setVisible(false);
        return;
      }
      window.sessionStorage.setItem("fgs-logo-intro-seen-v4", "true");
    } catch {
      // The intro can still run when session storage is unavailable.
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const leaveTimer = window.setTimeout(() => setLeaving(true), leaveAt * 1000);
    const hideTimer = window.setTimeout(() => {
      document.body.style.overflow = previousOverflow;
      setVisible(false);
    }, hideAt * 1000);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, [hideAt, leaveAt]);

  if (!visible) return null;

  return (
    <div className={`intro-logo-loader ${leaving ? "intro-logo-loader-leaving" : ""}`} aria-hidden="true">
      <div className="intro-logo-starfield" aria-hidden>
        {Array.from({ length: 88 }, (_, index) => (
          <span
            key={`star-${index}`}
            className={`intro-logo-star intro-logo-star--${index % 4}`}
            style={{
              left: `${(index * 37 + 11) % 100}%`,
              top: `${(index * 61 + 7) % 100}%`,
              animationDelay: `${(index % 13) * -0.7}s`,
            }}
          />
        ))}
      </div>
      <span className="intro-logo-x-comet intro-logo-x-comet--left" />
      <span className="intro-logo-x-comet intro-logo-x-comet--right" />
      <div className="intro-logo-lockup">
        <IntroLogoArtwork logoUrl={logoUrl} logoMode={logoMode} />
      </div>
    </div>
  );
}
