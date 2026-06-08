"use client";

import type { CompanyBranch } from "@prisma/client";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import { getLocalizedField } from "@/lib/i18n-content";
import { toVietnamMapPosition } from "@/lib/map/vietnam-map-position";
import type { Locale } from "@/i18n/routing";
import { PageSection } from "@/components/layout/PageSection";

interface VietnamMapProps {
  title: string;
  branches: CompanyBranch[];
  locale: Locale;
  hqAddress: string;
}

function DanangMarker({ label, position }: { label: string; position: { left: string; top: string } }) {
  return (
    <div
      className="vietnam-map-marker absolute z-20"
      style={{ left: position.left, top: position.top }}
      aria-label={label}
    >
      <svg
        className="pointer-events-none absolute left-[-88px] top-[-88px] h-[140px] w-[200px] overflow-visible"
        viewBox="0 0 200 140"
        aria-hidden
      >
        <path
          id="danang-s-curve"
          d="M 12 118 C 48 108, 62 42, 98 58 S 168 18, 188 8"
          fill="none"
          stroke="none"
        />
        <text className="fill-rose-700 text-[11px] font-bold dark:fill-rose-300">
          <textPath href="#danang-s-curve" startOffset="8%">
            {label}
          </textPath>
        </text>
      </svg>

      <span className="vietnam-map-marker-ripple vietnam-map-marker-ripple--1" aria-hidden />
      <span className="vietnam-map-marker-ripple vietnam-map-marker-ripple--2" aria-hidden />
      <span className="vietnam-map-marker-ripple vietnam-map-marker-ripple--3" aria-hidden />
      <span className="vietnam-map-marker-glow" aria-hidden />

      <span className="vietnam-map-marker-pin" aria-hidden>
        <svg viewBox="0 0 28 40" className="vietnam-map-marker-pin-icon" role="presentation">
          <defs>
            <linearGradient id="danang-pin-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff4d5e" />
              <stop offset="55%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>
            <filter id="danang-pin-shadow" x="-30%" y="-10%" width="160%" height="150%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#be123c" floodOpacity="0.45" />
            </filter>
          </defs>
          <path
            d="M14 1.5C8.2 1.5 3.5 6.2 3.5 12c0 7.2 10.5 24.5 10.5 24.5S24.5 19.2 24.5 12C24.5 6.2 19.8 1.5 14 1.5z"
            fill="url(#danang-pin-gradient)"
            filter="url(#danang-pin-shadow)"
          />
          <circle cx="14" cy="12" r="4.5" fill="#fff" opacity="0.95" />
          <circle cx="14" cy="12" r="2.2" fill="#fb7185" className="vietnam-map-marker-pin-core" />
        </svg>
      </span>
    </div>
  );
}

export function VietnamMap({ title, branches, locale, hqAddress }: VietnamMapProps) {
  const t = useTranslations("about");

  const hq = branches.find((b) => b.isHeadquarters) ?? branches[0];
  if (!hq) return null;

  const cityLabel = getLocalizedField(hq, "city", locale) || hq.city;
  const markerPos = toVietnamMapPosition(hq.latitude, hq.longitude);

  return (
    <PageSection muted tight>
      <h2 className="about-emphasis-heading">{title}</h2>

      <div className="mt-2.5 flex flex-col items-center gap-[10px] lg:flex-row lg:items-start lg:justify-start">
        <div className="w-full max-w-md shrink-0 lg:w-auto">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
            <div className="flex gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/60">
                <MapPin className="h-5 w-5" />
              </span>
              <div className="min-w-0 text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {t("hq_address_label")}
                </p>
                <p className="mt-1.5 text-base font-semibold leading-relaxed text-slate-800 md:text-lg dark:text-slate-100">
                  {hqAddress}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="vietnam-map-wrap relative aspect-[4/5] w-full max-w-[280px] shrink-0 sm:max-w-[300px]">
          <Image
            src="/images/vietnam-map.png"
            alt={t("map_alt")}
            fill
            priority
            className="vietnam-map-image object-contain object-top"
            sizes="(max-width: 1024px) 85vw, 380px"
          />
          <DanangMarker label={cityLabel} position={markerPos} />
        </div>
      </div>
    </PageSection>
  );
}
