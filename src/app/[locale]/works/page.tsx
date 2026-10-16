import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCachedWorks } from "@/lib/cache/queries";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSection } from "@/components/layout/PageSection";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { WorksProductsPanel } from "@/components/works/WorksProductsPanel";
import { AIPortfolioShowcase } from "@/components/works/AIPortfolioShowcase";
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

  const [allWorks, blocks, settings] = await Promise.all([
    getCachedWorks(true),
    fetchPageBlockMap("works"),
    getSettingsMapSafe(),
  ]);
  const aiProducts = allWorks.filter((work) => work.category === "ai").slice(0, 3);
  const works = allWorks.filter(
    (work) =>
      work.category !== "ai" &&
      (!category || category === "all" || work.category === category)
  );

  return (
    <div className="bg-linear-to-b from-sky-50/50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <PageHeader
        title={getPageBlockTitle(blocks, "page_header", loc, t("title"))}
        subtitle={getPageBlockSubtitle(blocks, "page_header", loc, t("subtitle"))}
        variant="works"
        promoteSubtitle
        backgroundColor={settings.page_header_works_bg}
      />
      {aiProducts.length > 0 ? (
        <AIPortfolioShowcase
          eyebrow={t("ai_showcase_eyebrow")}
          title={t("ai_showcase_title")}
          subtitle={t("ai_showcase_description")}
          productLabel={t("ai_product_label")}
          products={aiProducts}
          locale={loc}
        />
      ) : null}
      <PageSection>
        <WorksProductsPanel
          heading={t("client_work_heading")}
          locale={locale}
          loc={loc}
          currentCategory={category ?? "all"}
          works={works}
          viewLabel={t("view_details")}
        />
      </PageSection>
      <ScrollToTopButton />
    </div>
  );
}
