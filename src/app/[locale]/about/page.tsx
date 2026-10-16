import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageSection } from "@/components/layout/PageSection";
import { AboutOfficeScene } from "@/components/about/AboutOfficeScene";
import { AboutIdentityOrbit } from "@/components/about/AboutIdentityOrbit";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { TimelineSection } from "@/components/about/TimelineSection";
import { ActivitiesSection } from "@/components/about/ActivitiesSection";
import { AboutAgileWorkflow } from "@/components/about/AboutAgileWorkflow";
import { ConceptProductsSection } from "@/components/about/ConceptProductsSection";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { CoreValuesGrid } from "@/components/about/CoreValuesGrid";
import { AboutTechStackMarquee } from "@/components/about/AboutTechStackMarquee";
import { fetchAboutPageData } from "@/lib/cache/safe-about-data";
import { fetchPageBlockMap } from "@/lib/cache/safe-page-blocks";
import { getPageBlockBody, getPageBlockSubtitle, getPageBlockTitle } from "@/lib/page-content";
import { getSettingsMapSafe } from "@/lib/settings-safe";
import { getLocalizedField } from "@/lib/i18n-content";
import { getCachedTechStack, getCachedWorks } from "@/lib/cache/queries";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const loc = locale as Locale;

  const [{ aboutSections, timeline, activities, coreValues, whyItems }, blocks, settings, products, techStack] =
    await Promise.all([
      fetchAboutPageData(),
      fetchPageBlockMap("about"),
      getSettingsMapSafe(),
      getCachedWorks(true, "ai"),
      getCachedTechStack(),
    ]);
  const localizeAboutSection = (section: "history" | "mission" | "vision") => {
    const content = aboutSections.find((item) => item.section === section);
    if (!content || (blocks.about_content_control && !blocks[section])) return undefined;
    const block = blocks[section];
    if (!block) return content;
    const title = getPageBlockTitle(blocks, section, loc, content.title ?? "");
    const body = getPageBlockBody(blocks, section, loc, getLocalizedField(content, "content", loc));
    return {
      ...content,
      title,
      titleJa: title,
      titleVi: title,
      content: body,
      contentJa: body,
      contentVi: body,
    };
  };
  const mission = localizeAboutSection("mission");
  const vision = localizeAboutSection("vision");
  const story = localizeAboutSection("history");
  const managedWhyItems = Object.values(blocks)
    .filter((block) => block.key.startsWith("why_choose_"))
    .map((block) => {
      const title = getPageBlockTitle(blocks, block.key, loc, "");
      const description = getPageBlockBody(blocks, block.key, loc, "");
      const icon = getPageBlockSubtitle(blocks, block.key, loc, "Globe");
      return {
        id: block.id,
        icon,
        title,
        titleJa: title,
        titleVi: title,
        description,
        descriptionJa: description,
        descriptionVi: description,
      };
    })
    .filter((item) => item.title && item.description);
  const displayedWhyItems = blocks.why_choose_control ? managedWhyItems : whyItems;

  const headerTitle = getPageBlockTitle(blocks, "page_header", loc, t("title"));
  const headerSubtitle = getPageBlockSubtitle(blocks, "page_header", loc, t("subtitle"));

  return (
    <div className="overflow-x-clip bg-linear-to-b from-violet-50/50 via-white to-blue-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <section
        className="about-hero relative flex items-center overflow-hidden text-white"
        style={{ "--about-hero-bg": settings.page_header_about_bg ?? "#030508" } as React.CSSProperties}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_16%_48%,rgba(79,70,229,0.18),transparent_55%)]" />
        <AboutOfficeScene />
        <div className="about-hero-content container-narrow relative z-10 flex w-full items-center px-4 sm:px-6 lg:px-8">
          <div className="about-hero-copy">
            <p className="about-hero-eyebrow">{t("hero_eyebrow")}</p>
            <h1 className="about-hero-title">{headerTitle}</h1>
            {headerSubtitle ? <p className="about-hero-subtitle">{headerSubtitle}</p> : null}
            <span className="about-hero-rule" aria-hidden />
          </div>
        </div>
      </section>
      <AboutIdentityOrbit
        title={getPageBlockTitle(blocks, "identity_section", loc, t("identity_title"))}
        subtitle={getPageBlockSubtitle(blocks, "identity_section", loc, t("identity_subtitle"))}
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
      <CoreValuesGrid title={getPageBlockTitle(blocks, "values_section", loc, t("values_title"))} items={coreValues} locale={loc} />
      <PageSection muted tight className="!pt-3">
        <h2 className="about-emphasis-heading !pb-3 !pt-0">
          {getPageBlockTitle(blocks, "why_section", loc, t("why_japan_title"))}
        </h2>
        <WhyChooseUs items={displayedWhyItems} locale={loc} />
      </PageSection>

      <ConceptProductsSection
        eyebrow={getPageBlockTitle(blocks, "concept_products_eyebrow", loc, t("concept_products.eyebrow"))}
        title={getPageBlockTitle(blocks, "concept_products_section", loc, t("concept_products.title"))}
        subtitle={getPageBlockSubtitle(blocks, "concept_products_section", loc, t("concept_products.subtitle"))}
        productLabel={t("concept_products.concept_label")}
        products={products.slice(0, 3).map((product) => ({
          id: product.id,
          title: getLocalizedField(product, "title", loc),
          description: getLocalizedField(product, "summary", loc),
          features: product.techStack,
          appUrl: product.demoUrl,
        }))}
      />
      <AboutTechStackMarquee items={techStack} />

      <ActivitiesSection
        title={getPageBlockTitle(blocks, "activities_section", loc, t("activities_title"))}
        subtitle={getPageBlockSubtitle(blocks, "activities_section", loc, t("activities_subtitle"))}
        items={activities}
        locale={loc}
      />
      <AboutAgileWorkflow />
      <ScrollToTopButton />
    </div>
  );
}
