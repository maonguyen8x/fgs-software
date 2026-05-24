import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCachedWorks } from "@/lib/cache/queries";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSection } from "@/components/layout/PageSection";
import { WorksGrid } from "@/components/sections/WorksGrid";
import { WorksFilter } from "@/components/works/WorksFilter";
import type { Locale } from "@/i18n/routing";

export default async function WorksPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("works");
  const loc = locale as Locale;

  const works = await getCachedWorks(true, category);

  return (
    <div>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <PageSection>
        <WorksFilter locale={locale} currentCategory={category ?? "all"} />
        <div className="mt-5">
          <WorksGrid works={works} locale={loc} viewLabel={t("view_details")} />
        </div>
      </PageSection>
    </div>
  );
}
