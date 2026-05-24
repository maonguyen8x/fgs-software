import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import type { TimelineMilestone } from "@prisma/client";

interface TimelineSectionProps {
  title: string;
  items: TimelineMilestone[];
  locale: Locale;
}

function formatMilestoneDate(value: string, locale: Locale): string {
  const [year, month] = value.split("-");
  if (!year || !month) return value;
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat(
    locale === "ja" ? "ja-JP" : locale === "vi" ? "vi-VN" : "en-US",
    { month: "long", year: "numeric" }
  ).format(date);
}

export function TimelineSection({ title, items, locale }: TimelineSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="page-section">
      <div className="container-narrow">
        <h2 className="mb-8 text-center text-2xl font-bold text-heading md:text-3xl">{title}</h2>
        <div className="relative mx-auto max-w-2xl">
          <div
            className="absolute bottom-0 left-4 top-0 w-0.5 bg-gradient-to-b from-primary-400 via-primary-500 to-primary-300 md:left-1/2 md:-translate-x-px"
            aria-hidden
          />
          <ol className="space-y-6">
            {items.map((item, index) => (
              <li
                key={item.id}
                className={`relative flex gap-4 md:gap-0 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <div className="absolute left-4 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[var(--surface)] bg-primary-600 shadow-md md:left-1/2">
                  <span className="h-2 w-2 rounded-full bg-white" />
                </div>
                <div className="hidden flex-1 md:block" />
                <article
                  className={`content-block ml-10 flex-1 md:ml-0 ${
                    index % 2 === 0 ? "md:mr-6 md:text-right" : "md:ml-6"
                  }`}
                >
                  <time className="text-sm font-semibold text-primary-theme">
                    {formatMilestoneDate(item.milestoneDate, locale)}
                  </time>
                  <h3 className="mt-1.5 text-base font-bold text-heading md:text-lg">
                    {getLocalizedField(item, "title", locale)}
                  </h3>
                  {getLocalizedField(item, "description", locale) && (
                    <p className="content-prose-tight mt-1.5">
                      {getLocalizedField(item, "description", locale)}
                    </p>
                  )}
                </article>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
