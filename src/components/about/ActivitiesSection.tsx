"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { CompanyActivity } from "@prisma/client";
import type { Locale } from "@/i18n/routing";
import { getLocalizedField } from "@/lib/i18n-content";
import { PageSection } from "@/components/layout/PageSection";
import { cn } from "@/lib/utils";

interface ActivitiesSectionProps {
  title: string;
  items: CompanyActivity[];
  locale: Locale;
}

export function ActivitiesSection({ title, items, locale }: ActivitiesSectionProps) {
  const t = useTranslations("about");

  if (items.length === 0) return null;

  return (
    <PageSection muted>
      <div className="mb-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">{t("activities_badge")}</p>
        <h2 className="mt-2 text-2xl font-bold text-heading md:text-3xl">{title}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-theme">{t("activities_subtitle")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
        {items.map((item) => {
          const titleText = getLocalizedField(item, "title", locale);
          const description = getLocalizedField(item, "description", locale);
          const images = item.images ?? [];

          return (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              {images.length > 0 && (
                <div
                  className={cn(
                    "grid gap-1",
                    images.length === 1 && "grid-cols-1",
                    images.length === 2 && "grid-cols-2",
                    images.length >= 3 && "grid-cols-2"
                  )}
                >
                  {images.slice(0, 4).map((src, i) => (
                    <div
                      key={`${item.id}-${i}`}
                      className={cn(
                        "relative aspect-[4/3] bg-slate-100",
                        images.length >= 3 && i === 0 && "col-span-2 aspect-[21/9]"
                      )}
                    >
                      <Image src={src} alt="" fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" unoptimized />
                    </div>
                  ))}
                </div>
              )}
              <div className="p-5 md:p-6">
                {titleText && <h3 className="text-lg font-bold text-heading">{titleText}</h3>}
                {description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-theme whitespace-pre-line">{description}</p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </PageSection>
  );
}
