import { WorksFilter, type WorksFilterItem } from "@/components/works/WorksFilter";
import { WorksProjectCards } from "@/components/works/WorksProjectCards";
import type { Locale } from "@/i18n/routing";
import type { Work } from "@prisma/client";

interface WorksProductsPanelProps {
  locale: string;
  loc: Locale;
  currentCategory: string;
  works: Work[];
  filterItems: WorksFilterItem[];
  categoryLabels: Record<string, string>;
  viewLabel: string;
}

export function WorksProductsPanel({
  locale,
  loc,
  currentCategory,
  works,
  filterItems,
  categoryLabels,
  viewLabel,
}: WorksProductsPanelProps) {
  return (
    <div className="works-products-panel">
      <WorksFilter locale={locale} currentCategory={currentCategory} items={filterItems} />
      <div className="container-narrow px-4 pb-20 pt-12 sm:px-6 md:pt-16 lg:px-8">
        <WorksProjectCards works={works} locale={loc} viewLabel={viewLabel} categoryLabels={categoryLabels} />
      </div>
    </div>
  );
}
