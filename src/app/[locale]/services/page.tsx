import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCachedServices, getCachedTechStack } from "@/lib/cache/queries";
import { CONSULTATION_FORM_URL } from "@/config/consultation-form";
import { PageHeader } from "@/components/layout/PageHeader";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { PageSection } from "@/components/layout/PageSection";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { TechStackSection } from "@/components/sections/TechStackSection";
import { ConsultationFormLink } from "@/components/services/ConsultationFormLink";
import type { Locale } from "@/i18n/routing";
import { fetchPageBlockMap } from "@/lib/cache/safe-page-blocks";
import { getPageBlockSubtitle, getPageBlockTitle } from "@/lib/page-content";
import { getSettingsMapSafe } from "@/lib/settings-safe";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");
  const loc = locale as Locale;

  const [services, techStack, blocks, settings] = await Promise.all([
    getCachedServices(true),
    getCachedTechStack(),
    fetchPageBlockMap("services"),
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
      <PageSection>
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
