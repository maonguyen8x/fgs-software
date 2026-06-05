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
}

function DanangMarker({ label, position }: { label: string; position: { left: string; top: string } }) {
  return (
    <div
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
      style={{ left: position.left, top: position.top }}
    >
      <svg
        className="pointer-events-none absolute left-[-88px] top-[-72px] h-[140px] w-[200px] overflow-visible"
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
  const t = useTranslations("about");

  const hq = branches.find((b) => b.isHeadquarters) ?? branches[0];
  if (!hq) return null;

  const cityLabel = getLocalizedField(hq, "city", locale) || hq.city;
  const markerPos = toVietnamMapPosition(hq.latitude, hq.longitude);

  return (
    <PageSection muted tight>
      <h2 className="about-emphasis-heading">{title}</h2>

      <div className="mt-2.5 grid items-start gap-[15px] lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        <div className="flex flex-col">
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
                  {t("hq_address")}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="vietnam-map-wrap relative mx-auto aspect-[4/5] w-full max-w-sm self-start lg:mx-0 lg:ml-auto lg:max-w-md">
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
