"use client";

import { cn } from "@/lib/utils";

/** Transparent-center torus + minimal Nova AI mark (gradient ring only). */
export function NovaLauncherIcon({ className, size = 68 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn("nova-launcher-icon inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span className="nova-launcher-icon__glow" />
      <span className="nova-launcher-icon__ring" />
      <span className="nova-launcher-icon__mark">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[42%] w-[42%]">
          <defs>
            <linearGradient id="nova-mark-stroke" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="45%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
            <radialGradient id="nova-mark-core" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#a5b4fc" />
              <stop offset="100%" stopColor="#6366f1" />
            </radialGradient>
          </defs>
          <circle cx="16" cy="16" r="2.2" fill="url(#nova-mark-core)" />
          <path
            d="M16 7.5v3.8M16 20.7v3.8M7.5 16h3.8M20.7 16h3.8"
            stroke="url(#nova-mark-stroke)"
            strokeWidth="1.85"
            strokeLinecap="round"
          />
          <path
            d="M10.8 10.8l2.7 2.7M18.5 18.5l2.7 2.7M21.2 10.8l-2.7 2.7M13.5 18.5l-2.7 2.7"
            stroke="url(#nova-mark-stroke)"
            strokeWidth="1.35"
            strokeLinecap="round"
            opacity="0.72"
          />
        </svg>
      </span>
    </span>
  );
}
