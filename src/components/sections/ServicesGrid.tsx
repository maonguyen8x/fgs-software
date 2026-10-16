"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  previewTitle: string;
  previewHint: string;
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
  previewTitle,
  previewHint,
}: ServicesGridProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const activeIndex = services.findIndex((service) => service.id === activeKey);
  const activeService = activeIndex >= 0 ? services[activeIndex] : null;
  const ActiveIcon = activeService ? getIcon(activeService.icon) : null;
  const activeTitle = activeService ? getLocalizedField(activeService, "title", locale) : "";
  const activeDescription = activeService
    ? getLocalizedField(activeService, "description", locale)
    : "";

  useEffect(() => {
    setActiveKey((current) =>
      current && services.some((service) => service.id === current) ? current : null
    );
  }, [services]);

  return (
    <div
      className="services-capability-layout"
      onMouseLeave={() => setActiveKey(null)}
      onBlur={(event) => {
        if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) {
          setActiveKey(null);
        }
      }}
    >
      <div className="services-capability-list">
        {services.map((service, index) => {
          const active = activeKey === service.id;
          const Icon = getIcon(service.icon);
          const title = getLocalizedField(service, "title", locale);
          const panelId = `service-capability-${service.id}`;

          return (
            <div key={service.id} className="services-capability-item">
              <button
                type="button"
                aria-expanded={active}
                aria-controls={panelId}
                onMouseEnter={() => setActiveKey(service.id)}
                onFocus={() => setActiveKey(service.id)}
                onClick={() => setActiveKey(service.id)}
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
            </div>
          );
        })}
      </div>
      <aside className="services-capability-preview" aria-live="polite">
        <div className="services-capability-detail-glow" aria-hidden />
        <AnimatePresence mode="wait" initial={false}>
          {activeService && ActiveIcon ? (
              <motion.div
                key={activeService.id}
                id={`service-capability-${activeService.id}`}
                className="services-capability-preview-content"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="services-capability-preview-icon"><ActiveIcon aria-hidden /></span>
                <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">
                  {String(activeIndex + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">{activeTitle}</h3>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 md:text-base">
                  {activeDescription}
                </p>
                {activeService.techStack.length > 0 ? (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {activeService.techStack.map((technology) => (
                      <span key={technology} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-200">
                        {technology}
                      </span>
                    ))}
                  </div>
                ) : null}
                <ConsultationFormLink
                  href={consultationHref}
                  label={learnMoreLabel}
                  badgeLabel={formBadgeLabel}
                  variant="inline"
                  className="mt-7 w-fit border-white/20 bg-white/5 text-white hover:bg-white/10 dark:border-white/20 dark:bg-white/5 dark:text-white"
                />
              </motion.div>
          ) : (
            <motion.div
              key="preview-empty"
              className="services-capability-preview-empty"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.25 }}
            >
              <p className="text-xl font-semibold text-white">{previewTitle}</p>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-300">{previewHint}</p>
              <ArrowUpRight className="mt-8 h-5 w-5 text-violet-300" aria-hidden />
            </motion.div>
          )}
        </AnimatePresence>
      </aside>
    </div>
  );
}
