import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCachedServices, getCachedTechStack, getCachedWorks } from "@/lib/cache/queries";
import { CONSULTATION_FORM_URL } from "@/config/consultation-form";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { PageSection } from "@/components/layout/PageSection";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { TechStackSection } from "@/components/sections/TechStackSection";
import { ConsultationFormLink } from "@/components/services/ConsultationFormLink";
import { WorksProductsPanel } from "@/components/works/WorksProductsPanel";
import type { Locale } from "@/i18n/routing";
import { fetchPageBlockMap } from "@/lib/cache/safe-page-blocks";
import { getPageBlockSubtitle, getPageBlockTitle } from "@/lib/page-content";
import { getSettingsMapSafe } from "@/lib/settings-safe";

/** Products (works) and services share this page — see the "services" nav item. */
export default async function ServicesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("services");
  const tWorks = await getTranslations("works");
  const loc = locale as Locale;

  const [services, techStack, works, blocks, worksBlocks, settings] = await Promise.all([
    getCachedServices(true),
    getCachedTechStack(),
    getCachedWorks(true, category),
    fetchPageBlockMap("services"),
    fetchPageBlockMap("works"),
    getSettingsMapSafe(),
  ]);

  const categories = ["frontend", "backend", "mobile", "database", "devops", "tools"] as const;

  const headerTitle = getPageBlockTitle(blocks, "page_header", loc, t("title"));
  const headerSubtitle = getPageBlockSubtitle(blocks, "page_header", loc, t("subtitle"));
  const headerLead = headerSubtitle || headerTitle;

  return (
    <div className="bg-linear-to-b from-emerald-50/50 via-white to-sky-50/40">
      <PageHeader
        title={headerTitle}
        subtitle={headerLead}
        variant="services"
        promoteSubtitle
        backgroundColor={settings.page_header_services_bg}
      />
      <PageSection className="!pb-6 md:!pb-8">
        <div id="products" className="scroll-mt-24">
          <WorksProductsPanel
            heading={getPageBlockSubtitle(worksBlocks, "page_header", loc, tWorks("subtitle"))}
            locale={locale}
            loc={loc}
            currentCategory={category ?? "all"}
            works={works}
            viewLabel={tWorks("view_details")}
          />
        </div>
      </PageSection>

      <PageSection className="!pt-6 md:!pt-8">
        <h2
          id="services"
          className="mb-6 scroll-mt-24 text-center text-lg font-bold tracking-wide text-primary-700 md:mb-8 md:text-xl dark:text-primary-300"
        >
          {t("services_heading")}
        </h2>
        <ServicesGrid
          services={services}
          locale={loc}
          consultationHref={CONSULTATION_FORM_URL}
          learnMoreLabel={t("contact_cta")}
          formBadgeLabel={t("contact_cta_form_badge")}
        />
      </PageSection>

      <TechStackSection
        title={getPageBlockTitle(blocks, "tech_section", loc, t("tech_title"))}
        subtitle={getPageBlockSubtitle(blocks, "tech_section", loc, t("tech_subtitle"))}
        items={techStack}
        categories={categories}
      />

      <PageSection className="text-center">
        <ConsultationFormLink
          label={t("contact_cta")}
          badgeLabel={t("contact_cta_form_badge")}
          href={CONSULTATION_FORM_URL}
          variant="button"
        />
      </PageSection>
      <ScrollToTopButton />
    </div>
  );
}
