"use client";

import { useCallback, useRef } from "react";
import type { CompanyBranch } from "@prisma/client";
import { motion, useMotionValue, useSpring } from "framer-motion";
import Image from "next/image";
import { getLocalizedField } from "@/lib/i18n-content";
import { toVietnamMapPosition } from "@/lib/map/vietnam-map-position";
import type { Locale } from "@/i18n/routing";
import { PageSection } from "@/components/layout/PageSection";
import { SurfaceBlock } from "@/components/ui/SurfaceBlock";
import { RotatingGlobe } from "@/components/about/RotatingGlobe";

interface VietnamMapProps {
  title: string;
  branches: CompanyBranch[];
  locale: Locale;
}

function DanangMarker({ label, position }: { label: string; position: { left: string; top: string } }) {
  return (
    <div
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
      style={{ left: position.left, top: position.top }}
    >
      <svg
        className="pointer-events-none absolute -left-[88px] -top-[72px] h-[140px] w-[200px] overflow-visible"
        viewBox="0 0 200 140"
        aria-hidden
      >
        <path
          id="danang-s-curve"
          d="M 12 118 C 48 108, 62 42, 98 58 S 168 18, 188 8"
          fill="none"
          stroke="none"
        />
        <text className="fill-primary-700 text-[11px] font-bold dark:fill-primary-300">
          <textPath href="#danang-s-curve" startOffset="8%">
            {label}
          </textPath>
        </text>
      </svg>

      <span className="map-marker-pulse absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/25" />
      <span className="map-marker-pulse map-marker-pulse-delay absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/40" />
      <span className="relative z-10 block h-4 w-4 rounded-full border-2 border-white bg-primary-600 shadow-lg shadow-primary-600/50 ring-2 ring-primary-400/60 dark:border-slate-900" />
    </div>
  );
}

export function VietnamMap({ title, branches, locale }: VietnamMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 140, damping: 26 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 140, damping: 26 });

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      rotateY.set(x * 4);
      rotateX.set(-y * 3);
    },
    [rotateX, rotateY]
  );

  const resetTilt = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  const hq = branches.find((b) => b.isHeadquarters) ?? branches[0];
  if (!hq) return null;

  const cityLabel = getLocalizedField(hq, "city", locale) || hq.city;
  const markerPos = toVietnamMapPosition(hq.latitude, hq.longitude);

  return (
    <PageSection muted className="!py-8 md:!py-10">
      <h2 className="mb-8 text-center text-2xl font-bold text-heading md:mb-10 md:text-3xl">{title}</h2>

      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10">
        <div className="flex justify-center lg:justify-end">
          <RotatingGlobe />
        </div>

        <div
          ref={containerRef}
          className="relative mx-auto w-full max-w-md perspective-[1000px]"
          onPointerMove={handlePointerMove}
          onPointerLeave={resetTilt}
        >
          <motion.div
            className="relative aspect-[4/5] w-full"
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          >
            <div className="relative h-full w-full rounded-2xl bg-primary-50/30 p-2 dark:bg-primary-950/20">
              <Image
                src="/images/vietnam-map.png"
                alt="Bản đồ Việt Nam hình chữ S"
                fill
                priority
                className="object-contain object-center drop-shadow-[0_8px_24px_rgba(37,99,235,0.15)]"
                sizes="(max-width: 768px) 100vw, 400px"
              />
              <DanangMarker label={cityLabel} position={markerPos} />
            </div>
          </motion.div>
          <p className="mt-3 text-center text-xs font-medium text-primary-600 dark:text-primary-400">
            {locale === "vi" ? "Trụ sở chính · Đà Nẵng" : locale === "ja" ? "本社 · ダナン" : "Headquarters · Da Nang"}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {branches.map((branch, index) => (
            <motion.div
              key={branch.id}
              initial={false}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.35 }}
            >
              <SurfaceBlock className="border-l-4 border-l-primary-500">
                <h3 className="flex flex-wrap items-center gap-2 font-bold text-primary-theme">
                  {getLocalizedField(branch, "name", locale) || branch.name}
                  {branch.isHeadquarters && (
                    <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                      HQ
                    </span>
                  )}
                </h3>
                <p className="mt-1 text-sm font-medium text-heading">
                  {getLocalizedField(branch, "city", locale) || branch.city}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-theme">
                  {getLocalizedField(branch, "address", locale) || branch.address}
                </p>
              </SurfaceBlock>
            </motion.div>
          ))}
        </div>
      </div>
    </PageSection>
  );
}
