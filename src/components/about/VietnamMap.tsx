"use client";

import { useCallback, useRef } from "react";
import type { CompanyBranch } from "@prisma/client";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface VietnamMapProps {
  title: string;
  branches: CompanyBranch[];
  locale: Locale;
}

const VIETNAM_BOUNDS = {
  minLat: 8,
  maxLat: 23.5,
  minLng: 102,
  maxLng: 110,
};

function toMapPosition(latitude: number, longitude: number) {
  const latRatio =
    (VIETNAM_BOUNDS.maxLat - latitude) / (VIETNAM_BOUNDS.maxLat - VIETNAM_BOUNDS.minLat);
  const lngRatio =
    (longitude - VIETNAM_BOUNDS.minLng) / (VIETNAM_BOUNDS.maxLng - VIETNAM_BOUNDS.minLng);

  return {
    left: `${Math.min(72, Math.max(38, 42 + lngRatio * 28))}%`,
    top: `${Math.min(78, Math.max(18, 10 + latRatio * 68))}%`,
  };
}

export function VietnamMap({ title, branches, locale }: VietnamMapProps) {
  const t = useTranslations("about");
  const containerRef = useRef<HTMLDivElement>(null);
  const rotateX = useSpring(useMotionValue(0), { stiffness: 180, damping: 22 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 180, damping: 22 });

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      rotateY.set(x * 18);
      rotateX.set(-y * 14);
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
  const markerPos = toMapPosition(hq.latitude, hq.longitude);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${hq.latitude},${hq.longitude}`;

  return (
    <section className="section-padding">
      <motion.div
        className="container-narrow"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-10 text-center text-3xl font-bold text-heading md:text-4xl">{title}</h2>

        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div
            ref={containerRef}
            className="relative mx-auto w-full max-w-lg perspective-[1200px]"
            onPointerMove={handlePointerMove}
            onPointerLeave={resetTilt}
          >
            <motion.div
              className="relative aspect-[3/4] w-full"
              style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_50%_45%,rgba(37,99,235,0.35),transparent_65%)] opacity-80 blur-2xl"
              />

              <motion.div
                className="relative h-full w-full overflow-hidden rounded-[2rem] border border-primary-200/60 bg-gradient-to-br from-primary-50 via-white to-primary-100/80 p-6 shadow-2xl shadow-primary-600/15 dark:border-primary-800/60 dark:from-slate-900 dark:via-slate-900 dark:to-primary-950/40"
                style={{ transform: "translateZ(24px)" }}
              >
                <div className="relative mx-auto h-full w-full max-w-[320px]">
                  <Image
                    src="/images/vietnam-map.png"
                    alt="Vietnam map"
                    fill
                    priority
                    className="object-contain drop-shadow-[0_18px_32px_rgba(37,99,235,0.35)]"
                    sizes="(max-width: 768px) 80vw, 320px"
                  />

                  <motion.div
                    className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: markerPos.left, top: markerPos.top }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.35, type: "spring", stiffness: 260, damping: 18 }}
                  >
                    <span className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/25 animate-ping" />
                    <span className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/40 blur-sm" />
                    <MapPin className="relative h-8 w-8 -translate-x-[2px] text-red-600 drop-shadow-md" fill="currentColor" />
                  </motion.div>

                  <motion.div
                    className="absolute z-20 flex items-center gap-1.5 rounded-full border border-primary-200/80 bg-white/95 px-3 py-1.5 text-xs font-bold text-primary-700 shadow-lg backdrop-blur-sm dark:border-primary-700 dark:bg-slate-900/90 dark:text-primary-200"
                    style={{
                      left: markerPos.left,
                      top: markerPos.top,
                      transform: "translate(-50%, calc(-100% - 14px))",
                    }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                  >
                    <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                    {cityLabel}
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-theme",
                "bg-surface px-4 py-2.5 text-sm font-semibold text-primary-theme transition-colors",
                "hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-950/40"
              )}
            >
              <Navigation className="h-4 w-4" />
              {t("maps_link", { city: cityLabel })}
            </a>
          </div>

          <div className="space-y-4">
            {branches.map((branch, index) => (
              <motion.article
                key={branch.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="content-block group"
              >
                <h3 className="flex items-center gap-2 font-bold text-primary-theme">
                  {getLocalizedField(branch, "name", locale) || branch.name}
                  {branch.isHeadquarters && (
                    <span className="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
                      HQ
                    </span>
                  )}
                </h3>
                <p className="mt-1 font-medium text-heading">
                  {getLocalizedField(branch, "city", locale) || branch.city}
                </p>
                <p className="mt-2 text-sm text-muted-theme">
                  {getLocalizedField(branch, "address", locale) || branch.address}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
