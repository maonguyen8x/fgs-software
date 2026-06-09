"use client";

import type { CompanyBranch } from "@prisma/client";
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
      <span className="vietnam-map-marker-label" aria-hidden>
        {label}
      </span>

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
    <PageSection muted tight className="overflow-x-clip">
      <h2 className="about-emphasis-heading">{title}</h2>

      <div className="vietnam-branch-layout">
        <article className="vietnam-branch-address">
          <div className="vietnam-branch-address-accent" aria-hidden />
          <div className="vietnam-branch-address-body">
            <span className="vietnam-branch-address-icon">
              <MapPin className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <div className="min-w-0 flex-1 text-left">
              <p className="vietnam-branch-address-label">{t("hq_address_label")}</p>
              <p className="vietnam-branch-address-text">{hqAddress}</p>
            </div>
          </div>
        </article>

        <div className="vietnam-map-stage">
          <div className="vietnam-map-wrap">
            {/* Native img preserves PNG alpha; Next/Image can flatten transparency */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/vietnam-map.png?v=2"
              alt={t("map_alt")}
              className="vietnam-map-image"
              decoding="async"
              draggable={false}
            />
            <DanangMarker label={cityLabel} position={markerPos} />
          </div>
        </div>
      </div>
    </PageSection>
  );
}
