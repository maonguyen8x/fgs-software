import { WorksFilter } from "@/components/works/WorksFilter";
import { WorksGrid } from "@/components/sections/WorksGrid";
import type { Locale } from "@/i18n/routing";
import type { Work } from "@prisma/client";

interface WorksProductsPanelProps {
  heading: string;
  locale: string;
  loc: Locale;
  currentCategory: string;
  works: Work[];
  viewLabel: string;
}

export function WorksProductsPanel({
  heading,
  locale,
  loc,
  currentCategory,
  works,
  viewLabel,
}: WorksProductsPanelProps) {
  return (
    <div className="works-products-panel rounded-3xl border border-slate-200/90 bg-white/90 p-5 shadow-[0_8px_40px_-12px_rgba(15,23,42,0.12)] ring-1 ring-slate-100/80 backdrop-blur-sm md:p-7 lg:p-8 dark:border-slate-700/80 dark:bg-slate-900/90 dark:ring-slate-800/80">
      <h2 className="text-center text-lg font-bold tracking-wide text-primary-700 md:text-xl dark:text-primary-300">
        {heading}
      </h2>
      <div className="mt-4 md:mt-5">
        <WorksFilter locale={locale} currentCategory={currentCategory} />
      </div>
      <div className="mt-5 md:mt-6">
        <WorksGrid works={works} locale={loc} viewLabel={viewLabel} />
      </div>
    </div>
  );
}
