"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import type { TimelineMilestone } from "@prisma/client";
import { cn } from "@/lib/utils";
import { Building2, CalendarClock, Flag, Handshake, Milestone } from "lucide-react";

interface TimelineSectionProps {
  title: string;
  items: TimelineMilestone[];
  locale: Locale;
}

function formatMilestoneDate(value: string): string {
  const [year, month] = value.split("-");
  if (year && month) return `${month}/${year}`;
  return year || value;
}

function isPlaceholderMilestone(item: TimelineMilestone, locale: Locale): boolean {
  const title = getLocalizedField(item, "title", locale)?.trim();
  const description = getLocalizedField(item, "description", locale)?.trim();
  return !title && !description;
}

const palette = [
  {
    chip: "bg-[#b23b1e]",
    line: "border-[#b23b1e]",
    dot: "bg-[#b23b1e]",
  },
  {
    chip: "bg-[#0c5e7a]",
    line: "border-[#0c5e7a]",
    dot: "bg-[#0c5e7a]",
  },
  {
    chip: "bg-[#0b8a78]",
    line: "border-[#0b8a78]",
    dot: "bg-[#0b8a78]",
  },
  {
    chip: "bg-[#d59b00]",
    line: "border-[#d59b00]",
    dot: "bg-[#d59b00]",
  },
  {
    chip: "bg-[#be1f4d]",
    line: "border-[#be1f4d]",
    dot: "bg-[#be1f4d]",
  },
];
const iconList = [Building2, Handshake, CalendarClock, Milestone, Flag];

export function TimelineSection({ title, items, locale }: TimelineSectionProps) {
  const t = useTranslations("about");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const preparedItems = useMemo(
    () =>
      items
        .filter((item) => !item.milestoneDate.startsWith("2026-12"))
        .map((item, index) => ({
        fallbackDate: index === 0 ? "2026-05" : index === 1 ? "2026-06" : item.milestoneDate,
        fallbackTitle:
          index === 0
            ? locale === "ja"
              ? "2026年5月 ダナン支社を設立"
              : locale === "en"
                ? "05/2026: Da Nang branch established"
                : "5/2026 thành lập chi nhánh tại Đà Nẵng"
            : index === 1
              ? locale === "ja"
                ? "2026年6月 ABC社と協業開始"
                : locale === "en"
                  ? "06/2026: Partnership started with company ABC"
                  : "6/2026 hợp tác với công ty ABC"
              : "",
        ...item,
        titleText: getLocalizedField(item, "title", locale),
        descriptionText: getLocalizedField(item, "description", locale),
        placeholder: isPlaceholderMilestone(item, locale),
        tone: palette[index % palette.length],
        Icon: iconList[index % iconList.length],
        })),
    [items, locale]
  );

  if (items.length === 0) return null;

  return (
    <section className="relative overflow-visible py-3">
      <div className="container-narrow">
        <div className="overflow-visible rounded-3xl border border-slate-200/80 bg-white px-3 py-4 shadow-sm md:px-6 md:py-6">
          <div className="text-center">
            <h2 className="about-section-title md:text-3xl">{title}</h2>
            <p className="mx-auto max-w-2xl py-3 text-sm text-muted-theme">{t("timeline_hint")}</p>
          </div>
          <ol className="relative mx-auto max-w-5xl overflow-visible py-2">
          <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 hidden -translate-x-1/2 md:block">
            <span className="block h-full border-l-2 border-dashed border-slate-300" />
            {hoveredIndex !== null && preparedItems[hoveredIndex] ? (
              <span
                className={cn(
                  "absolute left-0 top-0 block -translate-x-1/2 border-l-2 transition-all duration-300",
                  preparedItems[hoveredIndex].tone.line
                )}
                style={{ height: `${((hoveredIndex + 0.5) / preparedItems.length) * 100}%` }}
              />
            ) : null}
          </div>

          {preparedItems.map((item, index) => {
            const isHovered = hoveredIndex === index;
            const alignRight = index % 2 === 1;
            const dateLabel = item.placeholder ? formatMilestoneDate(item.fallbackDate) : formatMilestoneDate(item.milestoneDate);
            const titleLabel = item.placeholder && item.fallbackTitle ? item.fallbackTitle : item.titleText;
            const theme = palette[index % palette.length];
            const popupOffset =
              index === 0 ? { marginLeft: "15px" } : index === 1 ? { marginRight: "15px" } : undefined;

            return (
              <li
                key={item.id}
                className="group relative grid grid-cols-1 py-4 md:grid-cols-[1fr_64px_1fr]"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className={cn("hidden md:flex", alignRight ? "md:order-1 md:justify-end md:pr-1" : "md:order-3")} />

                <div className="relative z-10 mx-auto hidden w-16 items-center justify-center md:flex md:order-2">
                  <span className={cn("z-10 flex h-11 w-11 items-center justify-center rounded-full border-4 border-white text-white shadow-lg", theme.dot)}>
                    <item.Icon className="h-4 w-4" />
                  </span>
                </div>

                <div
                  className={cn(
                    "relative mx-auto flex w-fit flex-col items-center",
                    alignRight ? "md:order-3 md:ml-1 md:items-start" : "md:order-1 md:mr-1 md:items-end"
                  )}
                >
                  <button
                    type="button"
                    className="relative w-fit cursor-pointer border-0 bg-transparent p-0 text-left transition-transform duration-300 hover:-translate-y-0.5"
                    onFocus={() => setHoveredIndex(index)}
                    onBlur={() => setHoveredIndex(null)}
                  >
                    <span
                      className={cn(
                        "absolute top-1/2 hidden h-0.5 w-5 -translate-y-1/2 md:block",
                        isHovered ? theme.dot : "bg-slate-300"
                      )}
                      style={alignRight ? { right: "100%" } : { left: "100%" }}
                    />
                    <span
                      className={cn(
                        "relative inline-flex min-w-28 items-center justify-center rounded-md px-4 py-2 text-xl font-extrabold tracking-tight text-white shadow-md",
                        theme.chip
                      )}
                      style={{
                        clipPath: alignRight
                          ? "polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)"
                          : "polygon(12px 0, 100% 0, 100% 100%, 12px 100%, 0 50%)",
                      }}
                    >
                      {dateLabel}
                    </span>
                  </button>

                  <div className={cn("mt-3 max-w-xs text-center md:max-w-sm", alignRight ? "md:text-left" : "md:text-right")}>
                    <h3 className="text-base font-bold leading-snug text-heading md:text-lg">
                      {titleLabel || t("timeline_placeholder")}
                    </h3>
                    {item.descriptionText ? (
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-theme">
                        {item.descriptionText}
                      </p>
                    ) : null}
                    {item.memberCount > 0 ? (
                      <p className="mt-2 text-xs font-semibold text-primary-700">
                        {t("timeline_members", { count: item.memberCount })}
                      </p>
                    ) : null}
                  </div>

                  <div
                    className={cn(
                      "pointer-events-none absolute top-1/2 z-30 hidden w-[450px] max-w-[calc(100vw-2rem)] -translate-y-1/2 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur md:block",
                      alignRight ? "left-[calc(100%+0.55rem)]" : "right-[calc(100%+0.55rem)]",
                      isHovered && item.images.length > 0 ? "opacity-100" : "opacity-0"
                    )}
                    style={popupOffset}
                  >
                    <span
                      className={cn(
                        "absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-45 border border-slate-200 bg-white",
                        alignRight ? "-left-2 border-r-0 border-t-0" : "-right-2 border-l-0 border-b-0"
                      )}
                    />
                    {item.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {item.images.slice(0, 4).map((src, imgIndex) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={`${src}-${imgIndex}`}
                            src={src}
                            alt=""
                            className="aspect-video w-full rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
          </ol>
        </div>
      </div>
    </section>
  );
}
