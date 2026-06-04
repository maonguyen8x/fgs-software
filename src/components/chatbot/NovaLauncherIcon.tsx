"use client";

import { cn } from "@/lib/utils";

/** Gradient torus launcher — colors rotate around the ring (Nova brand). */
export function NovaLauncherIcon({ className, size = 44 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn("nova-launcher-icon inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span className="nova-launcher-icon__halo" />
      <span className="nova-launcher-icon__ring" />
      <span className="nova-launcher-icon__shine" />
    </span>
  );
}
