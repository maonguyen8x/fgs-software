"use client";

import { useEffect, useState } from "react";

export function IntroLogoLoader({ companyName }: { companyName: string }) {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [brandMark = "FGS", ...brandNameParts] = companyName.trim().split(/\s+/);
  const letters = Array.from(brandMark);
  const software = brandNameParts.join(" ") || "Software";
  const logoRevealEnd = 2.75 + letters.length * 1.7;
  const softwareRevealStart = logoRevealEnd + 0.2;
  const softwareStep = 0.11;
  const revealEnd = softwareRevealStart + Math.max(0, software.length - 1) * softwareStep + 1.1;
  const leaveAt = revealEnd + 0.28;
  const hideAt = leaveAt + 0.5;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(false);
      return;
    }

    try {
      if (window.sessionStorage.getItem("fgs-logo-intro-seen-v2")) {
        setVisible(false);
        return;
      }
      window.sessionStorage.setItem("fgs-logo-intro-seen-v2", "true");
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
    <div
      className={`intro-logo-loader ${leaving ? "intro-logo-loader-leaving" : ""}`}
      aria-hidden="true"
    >
      <div className="intro-logo-starfield" aria-hidden>
        {Array.from({ length: 112 }, (_, index) => (
          <span
            key={index}
            className={`intro-logo-star intro-logo-star--${index % 4}`}
            style={{
              left: `${(index * 37 + 11) % 100}%`,
              top: `${(index * 61 + 7) % 100}%`,
              animationDelay: `${(index % 13) * -0.7}s`,
            }}
          />
        ))}
        {Array.from({ length: 8 }, (_, index) => (
          <span
            key={`comet-${index}`}
            className={`intro-logo-comet ${index < 4 ? "intro-logo-comet--left" : "intro-logo-comet--right"}`}
            style={{
              left: `${index < 4 ? 8 + index * 6 : 68 + (index - 4) * 6}%`,
              animationDelay: `${index < 4 ? index * 0.35 : 2.2 + (index - 4) * 0.35}s`,
            }}
          />
        ))}
        <span className="intro-logo-comet-x intro-logo-comet-x--down" />
        <span className="intro-logo-comet-x intro-logo-comet-x--up" />
      </div>
      <div className="intro-logo-lockup">
        <span className="intro-logo-outline" aria-hidden>
          {brandMark || "FGS"}
        </span>
        <span className="intro-logo-main">
          {letters.map((letter, index) => (
            <span key={`${letter}-${index}`} style={{ animationDelay: `${2.75 + index * 1.7}s` }}>
              {letter}
            </span>
          ))}
        </span>
        <span className="intro-logo-sub">
          {software.split("").map((letter, index, all) => (
            <span
              key={`${letter}-${index}`}
              style={{ animationDelay: `${softwareRevealStart + (all.length - 1 - index) * softwareStep}s` }}
            >
              {letter === " " ? "\u00a0" : letter}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
