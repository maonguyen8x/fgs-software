import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSection } from "@/components/layout/PageSection";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { TimelineSection } from "@/components/about/TimelineSection";
import { ActivitiesSection } from "@/components/about/ActivitiesSection";
import { AboutAgileWorkflow } from "@/components/about/AboutAgileWorkflow";
import { ConceptProductsSection } from "@/components/about/ConceptProductsSection";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { CoreValuesGrid } from "@/components/about/CoreValuesGrid";
import { AboutTechStackMarquee } from "@/components/about/AboutTechStackMarquee";
import { FoundersGrid } from "@/components/about/FoundersGrid";
import { fetchAboutPageData } from "@/lib/cache/safe-about-data";
import { fetchPageBlockMap } from "@/lib/cache/safe-page-blocks";
import { getPageBlockSubtitle, getPageBlockTitle } from "@/lib/page-content";
import { getSettingsMapSafe } from "@/lib/settings-safe";
import { getLocalizedField } from "@/lib/i18n-content";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const loc = locale as Locale;

  const [{ aboutSections, timeline, activities, coreValues, founders, whyItems }, blocks, settings] =
    await Promise.all([fetchAboutPageData(), fetchPageBlockMap("about"), getSettingsMapSafe()]);
  const mission = aboutSections.find((item) => item.section === "mission");
  const vision = aboutSections.find((item) => item.section === "vision");
  const story = aboutSections.find((item) => item.section === "history");

  const headerTitle = getPageBlockTitle(blocks, "page_header", loc, t("title"));
  const headerSubtitle = getPageBlockSubtitle(blocks, "page_header", loc, t("subtitle"));
  const headerLead = headerSubtitle || headerTitle;

  return (
    <div className="overflow-x-clip bg-linear-to-b from-violet-50/50 via-white to-blue-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <PageHeader
        title={headerTitle}
        subtitle={headerLead}
        variant="about"
        promoteSubtitle
        backgroundColor={settings.page_header_about_bg}
      />
      {story ? (
        <section className="container-narrow px-4 pb-8 sm:px-6 lg:px-8">
          <article className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm md:p-9">
            {getLocalizedField(story, "title", loc) ? (
              <h2 className="text-xl font-semibold tracking-tight text-slate-950 md:text-2xl">
                {getLocalizedField(story, "title", loc)}
              </h2>
            ) : null}
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 md:text-base">
              {getLocalizedField(story, "content", loc)}
            </p>
          </article>
        </section>
      ) : null}
      <TimelineSection
        title={getPageBlockTitle(blocks, "timeline_section", loc, t("timeline_title"))}
        items={timeline}
        locale={loc}
      />

      {(mission || vision) && (
        <section className="container-narrow grid gap-4 px-4 pb-8 sm:px-6 md:grid-cols-2 lg:px-8">
          {[mission, vision].map((item) =>
            item ? (
              <article key={item.id} className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-sm md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">
                  {item.section === "mission" ? t("mission") : t("vision")}
                </p>
                {getLocalizedField(item, "title", loc) ? (
                  <h2 className="mt-3 text-xl font-semibold text-slate-950">
                    {getLocalizedField(item, "title", loc)}
                  </h2>
                ) : null}
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 md:text-base">
                  {getLocalizedField(item, "content", loc)}
                </p>
              </article>
            ) : null
          )}
        </section>
      )}
      <CoreValuesGrid title={t("values_title")} items={coreValues} locale={loc} />
      <PageSection muted tight className="!pt-3">
        <h2 className="about-emphasis-heading !pb-3 !pt-0">{t("why_japan_title")}</h2>
        <WhyChooseUs items={whyItems} locale={loc} />
      </PageSection>

      <ConceptProductsSection
        eyebrow={t("concept_products.eyebrow")}
        title={t("concept_products.title")}
        subtitle={t("concept_products.subtitle")}
        products={[
          {
            title: t("concept_products.items.knowledge.title"),
            description: t("concept_products.items.knowledge.description"),
            label: t("concept_products.concept_label"),
          },
          {
            title: t("concept_products.items.vision.title"),
            description: t("concept_products.items.vision.description"),
            label: t("concept_products.concept_label"),
          },
          {
            title: t("concept_products.items.insights.title"),
            description: t("concept_products.items.insights.description"),
            label: t("concept_products.concept_label"),
          },
        ]}
      />
      <AboutTechStackMarquee />
      <FoundersGrid title={t("founders_title")} founders={founders} locale={loc} />

      <ActivitiesSection
        title={getPageBlockTitle(blocks, "activities_section", loc, t("activities_title"))}
        items={activities}
        locale={loc}
      />
      <AboutAgileWorkflow />
      <ScrollToTopButton />
    </div>
  );
}
