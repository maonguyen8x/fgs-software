import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCachedServices, getCachedTechStack } from "@/lib/cache/queries";
import { CONSULTATION_FORM_URL } from "@/config/consultation-form";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { PageSection } from "@/components/layout/PageSection";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { AboutTechStackMarquee } from "@/components/about/AboutTechStackMarquee";
import { ConsultationFormLink } from "@/components/services/ConsultationFormLink";
import type { Locale } from "@/i18n/routing";
import { fetchPageBlockMap } from "@/lib/cache/safe-page-blocks";
import { getPageBlockBody, getPageBlockSubtitle, getPageBlockTitle } from "@/lib/page-content";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");
  const loc = locale as Locale;

  const [services, techStack, blocks] = await Promise.all([
    getCachedServices(true),
    getCachedTechStack(),
    fetchPageBlockMap("services"),
  ]);

  const categories = ["frontend", "backend", "mobile", "database", "devops", "tools"] as const;
  const managedTechStack = Object.values(blocks)
    .filter((block) => block.key.startsWith("technology_"))
    .map((block) => ({
      id: block.id,
      name: getPageBlockTitle(blocks, block.key, loc, ""),
      category: getPageBlockBody(blocks, block.key, loc, ""),
      logoUrl: null,
      order: block.order,
      isVisible: true,
    }))
    .filter((item) => item.name && categories.includes(item.category as (typeof categories)[number]));
  const visibleTechStack = managedTechStack.length > 0 ? managedTechStack : techStack;

  return (
    <div className="bg-linear-to-b from-emerald-50/50 via-white to-sky-50/40">
      <section className="services-overview">
        <div className="container-narrow grid gap-8 px-4 py-14 sm:px-6 md:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] md:items-center md:py-20 lg:px-8">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-300">
              {getPageBlockTitle(blocks, "overview_eyebrow", loc, t("overview_eyebrow"))}
            </p>
            <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl dark:text-white">
              {getPageBlockTitle(blocks, "overview_section", loc, t("overview_title"))}
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base dark:text-slate-300">
              {getPageBlockSubtitle(blocks, "overview_section", loc, t("overview_description"))}
            </p>
          </div>
          <div className="services-overview-panel">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-200">
              {getPageBlockTitle(blocks, "overview_panel", loc, t("overview_panel_title"))}
            </p>
            <div className="mt-6 divide-y divide-white/10">
              {(["product", "platform", "intelligence"] as const).map((key, index) => (
                <div key={key} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <span className="font-mono text-xs text-violet-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium text-white md:text-base">
                    {getPageBlockTitle(blocks, `overview_item_${key}`, loc, t(`overview_items.${key}`))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <PageSection>
        <h2
          id="services"
          className="mb-6 scroll-mt-24 text-center text-lg font-bold tracking-wide text-primary-700 md:mb-8 md:text-xl dark:text-primary-300"
        >
          {getPageBlockTitle(blocks, "services_heading", loc, t("services_heading"))}
        </h2>
        <ServicesGrid
          services={services}
          locale={loc}
          consultationHref={CONSULTATION_FORM_URL}
          learnMoreLabel={getPageBlockTitle(blocks, "service_cta", loc, t("contact_cta"))}
          formBadgeLabel={t("contact_cta_form_badge")}
          previewTitle={t("preview_title")}
          previewHint={t("preview_hint")}
        />
      </PageSection>

      <AboutTechStackMarquee items={visibleTechStack} />

      <PageSection className="text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl dark:text-white">
            {getPageBlockTitle(blocks, "ready_section", loc, t("ready_title"))}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base dark:text-slate-300">
            {getPageBlockSubtitle(blocks, "ready_section", loc, t("ready_description"))}
          </p>
          <div className="mt-6">
            <ConsultationFormLink
              label={getPageBlockTitle(blocks, "service_cta", loc, t("contact_cta"))}
              badgeLabel={t("contact_cta_form_badge")}
              href={CONSULTATION_FORM_URL}
              variant="button"
            />
          </div>
        </div>
      </PageSection>
      <ScrollToTopButton />
    </div>
  );
}
