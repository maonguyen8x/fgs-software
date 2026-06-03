"use client";

import { ClientOnly } from "@/components/ui/ClientOnly";

function GlobeScene() {
  return (
    <div className="globe-scene relative mx-auto flex aspect-square w-full max-w-[220px] items-center justify-center md:max-w-[260px]">
      <div className="globe-spin-outer absolute inset-0 rounded-full">
        <div className="globe-spin-inner absolute inset-[6%] rounded-full bg-linear-to-br from-primary-400/90 via-primary-600 to-primary-900 shadow-[inset_-12px_-12px_40px_rgba(0,0,0,0.35),0_20px_50px_rgba(37,99,235,0.35)]">
          <div className="globe-grid absolute inset-0 rounded-full opacity-40" aria-hidden />
          <div className="absolute inset-[18%] rounded-full bg-linear-to-tr from-cyan-300/25 to-transparent" aria-hidden />
        </div>
      </div>
      <div className="pointer-events-none absolute -inset-4 rounded-full bg-primary-500/10 blur-2xl" aria-hidden />
    </div>
  );
}

export function RotatingGlobe() {
  return (
    <ClientOnly
      fallback={
        <div className="mx-auto aspect-square w-full max-w-[220px] rounded-full bg-primary-100 md:max-w-[260px]" />
      }
    >
      <GlobeScene />
    </ClientOnly>
  );
}
