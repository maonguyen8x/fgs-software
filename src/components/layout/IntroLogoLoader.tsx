"use client";

import { useEffect, useState } from "react";

export function IntroLogoLoader({ companyName }: { companyName: string }) {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(false);
      return;
    }

    try {
      if (window.sessionStorage.getItem("fgs-logo-intro-seen")) {
        setVisible(false);
        return;
      }
      window.sessionStorage.setItem("fgs-logo-intro-seen", "true");
    } catch {
      // The intro can still run when session storage is unavailable.
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const leaveTimer = window.setTimeout(() => setLeaving(true), 11_500);
    const hideTimer = window.setTimeout(() => setVisible(false), 12_000);
    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(hideTimer);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!visible) return null;
  const [brandMark, ...brandNameParts] = companyName.trim().split(/\s+/);
  const letters = Array.from(brandMark || "FGS");

  return (
    <div
      className={`intro-logo-loader ${leaving ? "intro-logo-loader-leaving" : ""}`}
      aria-hidden="true"
    >
      <div className="intro-logo-starfield" aria-hidden>
        {Array.from({ length: 48 }, (_, index) => (
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
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={`comet-${index}`}
            className="intro-logo-comet"
            style={{
              left: `${12 + index * 19}%`,
              animationDelay: `${index * -2.4}s`,
            }}
          />
        ))}
      </div>
      <div className="intro-logo-lockup">
        <span className="intro-logo-outline" aria-hidden>
          {brandMark || "FGS"}
        </span>
        <span className="intro-logo-main">
          {letters.map((letter, index) => (
            <span key={`${letter}-${index}`} style={{ animationDelay: `${3 + index * 1.05}s` }}>
              {letter}
            </span>
          ))}
        </span>
        <span className="intro-logo-sub">
          {(brandNameParts.join(" ") || "Software").split("").map((letter, index) => (
            <span key={`${letter}-${index}`} style={{ animationDelay: `${6.4 + index * 0.09}s` }}>
              {letter}
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
