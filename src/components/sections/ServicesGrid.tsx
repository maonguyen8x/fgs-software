"use client";

import { useEffect, useState } from "react";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, Plus } from "lucide-react";
import { ConsultationFormLink } from "@/components/services/ConsultationFormLink";
import type { Locale } from "@/i18n/routing";
import { getLocalizedField } from "@/lib/i18n-content";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  icon: string;
  title: string;
  titleJa?: string | null;
  titleVi?: string | null;
  description: string;
  descriptionJa?: string | null;
  descriptionVi?: string | null;
  techStack: string[];
  order: number;
}

interface ServicesGridProps {
  services: Service[];
  locale: Locale;
  consultationHref: string;
  learnMoreLabel: string;
  formBadgeLabel: string;
}

function getIcon(name: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon | undefined>;
  return icons[name] ?? LucideIcons.Code2;
}

export function ServicesGrid({
  services,
  locale,
  consultationHref,
  learnMoreLabel,
  formBadgeLabel,
}: ServicesGridProps) {
  const [activeKey, setActiveKey] = useState<string | null>(
    () => services[0]?.id ?? null
  );

  useEffect(() => {
    setActiveKey((current) =>
      current && services.some((service) => service.id === current)
        ? current
        : services[0]?.id ?? null
    );
  }, [services]);

  return (
    <div className="services-capability-list">
      {services.map((service, index) => {
        const active = activeKey === service.id;
        const Icon = getIcon(service.icon);
        const title = getLocalizedField(service, "title", locale);
        const description = getLocalizedField(service, "description", locale);
        const panelId = `service-capability-${service.id}`;

        return (
          <div key={service.id} className="services-capability-item">
            <button
              type="button"
              aria-expanded={active}
              aria-controls={panelId}
              onMouseEnter={() => setActiveKey(service.id)}
              onFocus={() => setActiveKey(service.id)}
              onClick={() => setActiveKey(active ? null : service.id)}
              className={cn(
                "services-capability-trigger group",
                active && "services-capability-trigger-active"
              )}
            >
              <span className="services-capability-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="services-capability-icon">
                <Icon className="h-5 w-5" strokeWidth={1.6} aria-hidden />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-base font-medium tracking-tight sm:text-lg">
                  {title}
                </span>
              </span>
              <Plus
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-300",
                  active && "rotate-45"
                )}
                aria-hidden
              />
            </button>
            <div
              id={panelId}
              className={cn("services-capability-detail", !active && "hidden")}
              aria-hidden={!active}
            >
              <div className="services-capability-detail-glow" aria-hidden />
              <div className="relative grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">
                    {String(index + 1).padStart(2, "0")} /                     {String(services.length).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-white md:text-2xl">
                    {title}
                  </h3>
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">
                    {description}
                  </p>
                  {service.techStack.length > 0 ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {service.techStack.map((technology) => (
                        <span
                          key={technology}
                          className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-200"
                        >
                          {technology}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <ConsultationFormLink
                  href={consultationHref}
                  label={learnMoreLabel}
                  badgeLabel={formBadgeLabel}
                  variant="inline"
                  className="relative w-fit border-white/20 bg-white/5 text-white hover:bg-white/10 dark:border-white/20 dark:bg-white/5 dark:text-white"
                />
                <ArrowUpRight className="absolute right-0 top-0 hidden h-5 w-5 text-violet-200 md:block" aria-hidden />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
