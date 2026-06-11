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

type ActivityDisplayItem = {
  id: string;
  image: string;
  title: string;
  description: string;
};

function flattenActivities(items: CompanyActivity[], locale: Locale): ActivityDisplayItem[] {
  const result: ActivityDisplayItem[] = [];
  for (const item of items) {
    const title = getLocalizedField(item, "title", locale);
    const description = getLocalizedField(item, "description", locale);
    const images = item.images ?? [];
    if (images.length === 0) {
      if (title || description) {
        result.push({ id: item.id, image: "", title, description });
      }
      continue;
    }
    images.forEach((image, index) => {
      result.push({
        id: `${item.id}-${index}`,
        image,
        title,
        description,
      });
    });
  }
  return result;
}

export function ActivitiesSection({ title, items, locale }: ActivitiesSectionProps) {
  const t = useTranslations("about");
  const displayItems = flattenActivities(items, locale);

  if (displayItems.length === 0) return null;

  return (
    <PageSection muted tight>
      <div className="text-center">
        <p className="py-3 text-sm font-semibold uppercase tracking-widest text-primary-600">
          {t("activities_badge")}
        </p>
        <h2 className="about-section-title !py-3">{title}</h2>
        <p className="mx-auto max-w-xl py-3 text-sm text-muted-theme">{t("activities_subtitle")}</p>
      </div>

      <div className="mx-auto mt-4 max-w-5xl space-y-10 md:space-y-14">
        {displayItems.map((item, index) => {
          const reversed = index % 2 === 1;
          return (
            <article
              key={item.id}
              className={cn(
                "flex flex-col gap-6 md:items-center md:gap-10",
                reversed ? "md:flex-row-reverse" : "md:flex-row"
              )}
            >
              {item.image && (
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-md md:w-[52%]">
                  <Image
                    src={item.image}
                    alt={item.title || item.description || ""}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized
                  />
                </div>
              )}

              <div
                className={cn(
                  "flex flex-1 flex-col justify-center text-left md:min-w-0 md:max-w-[48%]",
                  !item.image && "md:max-w-none"
                )}
              >
                {item.title && (
                  <h3 className="text-xl font-bold text-heading md:text-2xl">{item.title}</h3>
                )}
                {item.description && (
                  <p
                    className={cn(
                      "text-sm leading-relaxed text-muted-theme whitespace-pre-line md:text-base",
                      item.title && "mt-3"
                    )}
                  >
                    {item.description}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </PageSection>
  );
}
