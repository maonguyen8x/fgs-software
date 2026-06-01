import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCachedWorks } from "@/lib/cache/queries";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSection } from "@/components/layout/PageSection";
import { WorksGrid } from "@/components/sections/WorksGrid";
import { WorksFilter } from "@/components/works/WorksFilter";
import type { Locale } from "@/i18n/routing";
import { fetchPageBlockMap } from "@/lib/cache/safe-page-blocks";
import { getPageBlockSubtitle, getPageBlockTitle } from "@/lib/page-content";
import { getSettingsMapSafe } from "@/lib/settings-safe";

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

  const [works, blocks, settings] = await Promise.all([
    getCachedWorks(true, category),
    fetchPageBlockMap("works"),
    getSettingsMapSafe(),
  ]);
  const headerTitle = getPageBlockTitle(blocks, "page_header", loc, t("title"));
  const headerSubtitle = getPageBlockSubtitle(blocks, "page_header", loc, t("subtitle"));
  const headerLead = headerSubtitle || headerTitle;

  return (
    <div className="bg-linear-to-b from-indigo-50/50 via-white to-fuchsia-50/35">
      <PageHeader
        title={headerTitle}
        subtitle={headerLead}
        variant="works"
        promoteSubtitle
        backgroundColor={settings.page_header_works_bg}
      />
      <PageSection>
        <WorksFilter locale={locale} currentCategory={category ?? "all"} />
        <div className="mt-5">
          <WorksGrid works={works} locale={loc} viewLabel={t("view_details")} />
        </div>
      </PageSection>
    </div>
  );
}
