"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { CompanyBranch } from "@prisma/client";
import type { Locale } from "@/i18n/routing";
import { getLocalizedField } from "@/lib/i18n-content";
import { MapPin } from "lucide-react";

const NETWORK_ENDPOINTS = [
  { longitude: -74, latitude: 40 },
  { longitude: 2, latitude: 48 },
  { longitude: 78, latitude: 22 },
  { longitude: 139, latitude: 35 },
  { longitude: 151, latitude: -33 },
];

const CITY_LIGHTS = [
  [20, 47], [29, 52], [36, 44], [45, 58], [55, 50], [64, 42],
  [74, 55], [88, 47], [101, 40], [111, 52], [124, 45], [133, 64],
  [146, 58], [159, 49], [174, 56], [188, 43], [201, 48], [213, 57],
  [224, 43], [236, 52], [247, 46], [258, 58], [269, 49], [280, 61],
  [291, 75], [301, 63], [313, 55], [322, 46], [334, 59], [344, 48],
] as const;

function getMapPoint(longitude: number, latitude: number) {
  return { x: longitude + 180, y: 90 - latitude };
}

interface ContactLocationsProps {
  title: string;
  subtitle: string;
  branches: CompanyBranch[];
  locale: Locale;
}

export function ContactLocations({
  title,
  subtitle,
  branches,
  locale,
}: ContactLocationsProps) {
  const t = useTranslations("contact");
  const [selectedId, setSelectedId] = useState(
    () => (branches.find((branch) => branch.isHeadquarters) ?? branches[0])?.id
  );
  const selected = branches.find((branch) => branch.id === selectedId) ?? branches[0];
  const city = selected
    ? getLocalizedField(selected, "city", locale) || selected.city
    : t("fallback_location");
  const latitude = selected?.latitude ?? 16.0544;
  const longitude = selected?.longitude ?? 108.2022;
  const mapPoint = getMapPoint(longitude, latitude);
  const centeredPoint = { ...mapPoint, x: mapPoint.x + 360 };
  const mapLeft = -100 - longitude / 3.6;
  const routeData = NETWORK_ENDPOINTS.map((endpoint) => {
    const destination = getMapPoint(endpoint.longitude, endpoint.latitude);
    destination.x += Math.round((centeredPoint.x - destination.x) / 360) * 360;
    const controlX = (centeredPoint.x + destination.x) / 2;
    const controlY = Math.min(centeredPoint.y, destination.y) - 18;
    return {
      destination,
      path: `M ${centeredPoint.x} ${centeredPoint.y} Q ${controlX} ${controlY} ${destination.x} ${destination.y}`,
    };
  });

  return (
    <section className="contact-locations-section relative isolate overflow-hidden">
      <div className="contact-locations-glow pointer-events-none absolute inset-0" aria-hidden />
      <div className="container-narrow relative px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="mb-9 max-w-5xl">
          <p className="contact-locations-eyebrow">{title}</p>
          <h2 className="contact-locations-heading">
            {subtitle}
          </h2>
        </div>

        <div className="grid items-center gap-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.92fr)] lg:gap-8">
          <div className="contact-globe-card relative mx-auto aspect-square w-full max-w-[590px] overflow-hidden rounded-[2rem]">
            <div className="contact-globe-aura pointer-events-none absolute inset-0" aria-hidden />

            <div className="contact-globe-sphere absolute left-1/2 top-1/2 aspect-square w-[78%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full">
              <svg
                viewBox="0 0 1080 180"
                preserveAspectRatio="none"
                className="contact-globe-map-strip"
                style={{ left: `${mapLeft}%` }}
                aria-hidden
              >
                <defs>
                  <filter id="contact-city-glow">
                    <feGaussianBlur stdDeviation="1.2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="contact-route-glow">
                    <feGaussianBlur stdDeviation=".9" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                {[0, 360, 720].map((offset) => (
                  <g key={offset} transform={`translate(${offset} 0)`}>
                    <g className="contact-globe-land">
                      <path d="M18 31 30 25 39 28 47 23 57 27 64 23 72 28 79 24 86 29 92 27 100 34 111 35 115 41 111 45 116 49 109 53 108 59 101 61 97 68 91 67 87 75 82 79 77 74 74 67 68 66 64 59 57 58 54 51 47 49 43 44 35 43 31 37 23 37Z" />
                      <path d="m85 75 8 2 8 8 7 6 3 11-4 9-5 13-6 13-5 14-5 8-5-7 1-11-4-9 2-12-5-9 2-10-5-8 3-9Z" />
                      <path d="m112 18 8-5 12 2 7 7-4 7-12 1-9-4Z" />
                      <path d="m164 35 9-6 13 2 7 5 13-2 9 5 14-2 12 5 12-3 11 7 16-2 11 7 16-1 13 8 8 11-6 7-12-2-8 5-13-1-8 8-11-2-7-8-8 2-8-10-8 2-6-9-12 3-7-6-10 2-7-8-12 2-8-7-13 4-8-8-12 1-7-7Z" />
                      <path d="m183 58 12-4 9 5 7 9-2 11-5 13-7 15-6 17-7 12-7-6 1-11-6-9 2-11-6-9 4-10-5-8 7-8Z" />
                      <path d="m235 71 9-2 8 7 5 12-4 9-8 8-6-7-5-13Z" />
                      <path d="m265 73 8 1 8 9 8 4 6 9-4 8-10-1-5-8-8-4-7-10Z" />
                      <path d="m300 119 12-5 15 4 13 9 5 11-8 8-15 2-12-5-10-10Z" />
                      <path d="m322 105 5 2 3 8-5 4-4-6Z" />
                      <path d="m300 108 3 2-2 7-4-2Z" />
                      <path
                        className="contact-globe-vietnam"
                        d="m282.2 66.8 1.5-1.5 2.1-.5 1.5-1.2 1.7.8 1.4 1.6-.8 1.7 1.1 1.8-.5 1.7.8 1.6-.7 1.8.6 1.8-.8 1.6.7 1.8-1 1.8-.5 1.8-1.4 1.5-1.7-.2-1.2-1.2-1.4.3-1-1.2.8-1.4-.3-1.8.7-1.6-.5-1.6.5-1.8-.7-1.6.6-1.8-.8-1.5.6-1.7Z"
                      />
                    </g>
                    <g className="contact-globe-city-lights" filter="url(#contact-city-glow)">
                      {CITY_LIGHTS.map(([x, y], index) => (
                        <circle
                          key={`${offset}-light-${index}`}
                          cx={x}
                          cy={y}
                          r={index % 5 === 0 ? "1.3" : ".8"}
                        />
                      ))}
                    </g>
                  </g>
                ))}
                <g className="contact-globe-routes">
                  {routeData.map(({ path, destination }, index) => (
                    <g key={`route-${index}`}>
                      <path d={path} style={{ animationDelay: `${index * -1.7}s` }} />
                      <circle cx={destination.x} cy={destination.y} r="1.4" />
                    </g>
                  ))}
                </g>
                <circle
                  className="contact-globe-selected-point"
                  cx={centeredPoint.x}
                  cy={centeredPoint.y}
                  r="2.4"
                />
                <text
                  className="contact-globe-city-label"
                  x={centeredPoint.x + 5}
                  y={centeredPoint.y - 4}
                >
                  {city}
                </text>
              </svg>
              <svg
                viewBox="0 0 100 100"
                className="contact-globe-latitudes pointer-events-none absolute inset-0 h-full w-full"
                aria-hidden
              >
                <circle cx="50" cy="50" r="49" />
                <ellipse cx="50" cy="50" rx="49" ry="17" />
                <ellipse cx="50" cy="50" rx="49" ry="33" />
                <ellipse cx="50" cy="50" rx="18" ry="49" />
                <ellipse cx="50" cy="50" rx="35" ry="49" />
                <path d="M2 50h96M7 34h86M7 66h86" />
              </svg>
              <div className="contact-globe-shading pointer-events-none absolute inset-0 rounded-full" aria-hidden />
            </div>
            <div className="contact-globe-caption">
              <span className="contact-globe-caption-pin">
                <MapPin className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">{city}</span>
                <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
                  {selected?.isHeadquarters ? t("headquarters") : t("global_network")}
                </span>
              </span>
              <span className="ml-auto rounded-full bg-violet-500 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white">
                {selected?.isHeadquarters ? t("headquarters") : t("global_network")}
              </span>
            </div>
          </div>

          <div className="contact-location-list">
            <div className="mb-4 flex items-center gap-3">
              <span className="contact-location-list-icon">
                <MapPin className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">
                  {t("global_network")}
                </p>
                <p className="mt-1 text-sm text-slate-400">{city}</p>
              </div>
            </div>

            {branches.length > 0 ? (
              <div className="space-y-3">
                {branches.map((branch) => {
                  const active = branch.id === selected?.id;
                  const branchCity =
                    getLocalizedField(branch, "city", locale) || branch.city;
                  const address =
                    getLocalizedField(branch, "address", locale) || branch.address;
                  return (
                    <button
                      key={branch.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelectedId(branch.id)}
                      className={`contact-location-card ${active ? "contact-location-card-active" : ""}`}
                    >
                      <span className="contact-location-card-code" aria-hidden>
                        VN
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-semibold text-white">{branchCity}</span>
                          {branch.isHeadquarters ? (
                            <span className="contact-location-hq">{t("headquarters")}</span>
                          ) : null}
                        </span>
                        <span className="mt-1.5 block text-xs leading-relaxed text-slate-400">
                          {address}
                        </span>
                      </span>
                      <span className="contact-location-index" aria-hidden>
                        {String(branch.order).padStart(2, "0")}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="contact-location-card contact-location-card-active">
                <span className="contact-location-card-code" aria-hidden>VN</span>
                <span className="min-w-0 flex-1">
                  <span className="font-semibold text-white">{t("fallback_location")}</span>
                  <span className="mt-1.5 block text-xs leading-relaxed text-slate-400">
                    {t("headquarters")}
                  </span>
                </span>
                <span className="contact-location-index" aria-hidden>01</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
