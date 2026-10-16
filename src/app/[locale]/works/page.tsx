import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCachedWorks } from "@/lib/cache/queries";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { WorksProductsPanel } from "@/components/works/WorksProductsPanel";
import { WORK_CATEGORY_ORDER } from "@/components/works/work-categories";
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
  const works =
    !category || category === "all" ? allWorks : allWorks.filter((work) => work.category === category);

  const countByCategory = new Map<string, number>();
  for (const work of allWorks) {
    countByCategory.set(work.category, (countByCategory.get(work.category) ?? 0) + 1);
  }
  const knownKeys: readonly string[] = WORK_CATEGORY_ORDER;
  const categoryKeys = [
    ...WORK_CATEGORY_ORDER.filter((key) => countByCategory.has(key)),
    ...[...countByCategory.keys()].filter((key) => !knownKeys.includes(key)),
  ];
  const categoryLabels = Object.fromEntries(
    categoryKeys.map((key) => [key, t.has(`filter_${key}`) ? t(`filter_${key}`) : key])
  );
  const filterItems = [
    { key: "all", label: t("filter_all"), count: allWorks.length },
    ...categoryKeys.map((key) => ({
      key,
      label: categoryLabels[key],
      count: countByCategory.get(key) ?? 0,
    })),
  ];
  const activeCategory = filterItems.some((item) => item.key === category) ? (category as string) : "all";

  return (
    <div className="bg-white dark:bg-slate-950">
      <PageHeader
        title={getPageBlockTitle(blocks, "page_header", loc, t("title"))}
        subtitle={getPageBlockSubtitle(blocks, "page_header", loc, t("subtitle"))}
        variant="works"
        promoteSubtitle
        backgroundColor={settings.page_header_works_bg}
      />
      {aiProducts.length > 0 ? (
        <AIPortfolioShowcase
          eyebrow={getPageBlockTitle(blocks, "ai_showcase_eyebrow", loc, t("ai_showcase_eyebrow"))}
          title={getPageBlockTitle(blocks, "ai_showcase_section", loc, t("ai_showcase_title"))}
          subtitle={getPageBlockSubtitle(blocks, "ai_showcase_section", loc, t("ai_showcase_description"))}
          productLabel={t("ai_product_label")}
          products={aiProducts}
          locale={loc}
        />
      ) : null}
      <WorksProductsPanel
        locale={locale}
        loc={loc}
        currentCategory={activeCategory}
        works={works}
        filterItems={filterItems}
        categoryLabels={categoryLabels}
        viewLabel={t("view_details")}
      />
      <ScrollToTopButton />
    </div>
  );
}
