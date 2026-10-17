"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ClientOnly } from "@/components/ui/ClientOnly";

// Dynamically import Three components with no SSR
const Scene3D = dynamic(() => import("./3d/Chip3DScene").then(m => ({ default: m.Chip3DScene })), {
  ssr: false,
  loading: () => <FallbackChipImage />,
});

function FallbackChipImage() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
      <div className="relative w-64 h-64">
        <svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Chip body */}
          <rect x="60" y="60" width="136" height="136" rx="8" fill="#1a1a1a" stroke="#6366f1" strokeWidth="2" />
          {/* Grid dots on chip */}
          {[...Array(5)].map((_, i) =>
            [...Array(5)].map((_, j) => (
              <circle
                key={`dot-${i}-${j}`}
                cx={80 + j * 24}
                cy={80 + i * 24}
                r="2"
                fill="#818cf8"
                opacity="0.6"
              />
            ))
          )}
          {/* AI text */}
          <text x="128" y="140" fontSize="32" fontWeight="bold" textAnchor="middle" fill="#6366f1">
            AI
          </text>
          {/* Glow circle */}
          <circle cx="128" cy="128" r="100" fill="none" stroke="#6366f1" strokeWidth="1" opacity="0.3" />
        </svg>
      </div>
    </div>
  );
}

export function HeroChip3D() {
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
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <FallbackChipImage />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
    >
      <ClientOnly>
        {isVisible && <Scene3D />}
      </ClientOnly>
    </div>
  );
}
