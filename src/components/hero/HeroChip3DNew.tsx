"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ClientOnly } from "@/components/ui/ClientOnly";

// Dynamically import Three components with no SSR
const Chip3DScene = dynamic(
  () => import("./Chip3DSceneV3").then((m) => ({ default: m.Chip3DSceneV3 })),
  {
    ssr: false,
    loading: () => <FallbackChipImage />,
  }
);

function FallbackChipImage() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
      <div className="relative w-96 h-96">
        <svg
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full opacity-50"
        >
          {/* Chip background */}
          <rect x="75" y="100" width="250" height="200" rx="12" fill="#0b0b10" stroke="#ffb347" strokeWidth="3" />

          {/* Dots on chip */}
          {[...Array(7)].map((_, i) =>
            [...Array(5)].map((_, j) => (
              <circle
                key={`dot-${i}-${j}`}
                cx={95 + i * 35}
                cy={130 + j * 30}
                r="4"
                fill="#ff7a18"
                opacity="0.6"
              />
            ))
          )}

          {/* AI text */}
          <text
            x="200"
            y="235"
            fontSize="56"
            fontWeight="bold"
            textAnchor="middle"
            fill="#ffb347"
            fontFamily="monospace"
          >
            AI
          </text>

          {/* Glow circle */}
          <circle cx="200" cy="200" r="140" fill="none" stroke="#ff7a18" strokeWidth="2" opacity="0.3" />

          {/* Circuit traces */}
          <line x1="75" y1="150" x2="30" y2="120" stroke="#ffb347" strokeWidth="1.5" opacity="0.5" />
          <line x1="325" y1="180" x2="370" y2="200" stroke="#ffb347" strokeWidth="1.5" opacity="0.5" />
          <line x1="200" y1="300" x2="180" y2="360" stroke="#ffb347" strokeWidth="1.5" opacity="0.5" />
          <line x1="200" y1="300" x2="220" y2="360" stroke="#ffb347" strokeWidth="1.5" opacity="0.5" />
        </svg>
      </div>
    </div>
  );
}

export function HeroChip3DNew() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // Pause rendering when hero is off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(containerRef.current);

    // Pause rendering when tab is hidden
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Show fallback if prefers-reduced-motion
  if (prefersReducedMotion) {
    return (
      <div
        ref={containerRef}
        className="pointer-events-none absolute inset-0 min-h-[600px] h-full"
        aria-hidden="true"
      >
        <FallbackChipImage />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 min-h-[600px] h-full"
      aria-hidden="true"
    >
      <ClientOnly>
        {isVisible && <Chip3DScene />}
      </ClientOnly>
    </div>
  );
}
