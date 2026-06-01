import { getTranslations, setRequestLocale } from "next-intl/server";
import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSection } from "@/components/layout/PageSection";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { TimelineSection } from "@/components/about/TimelineSection";
import { ActivitiesSection } from "@/components/about/ActivitiesSection";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { CoreValuesGrid } from "@/components/about/CoreValuesGrid";
import { VietnamMap } from "@/components/about/VietnamMap";
import { FoundersGrid } from "@/components/about/FoundersGrid";
import { fetchAboutPageData } from "@/lib/cache/safe-about-data";
import { fetchPageBlockMap } from "@/lib/cache/safe-page-blocks";
import { getPageBlockSubtitle, getPageBlockTitle } from "@/lib/page-content";
import { getSettingsMapSafe } from "@/lib/settings-safe";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const loc = locale as Locale;

  const [{ aboutSections, timeline, activities, coreValues, branches, founders, whyItems }, blocks, settings] =
    await Promise.all([fetchAboutPageData(), fetchPageBlockMap("about"), getSettingsMapSafe()]);

  const mission = aboutSections.find((s) => s.section === "mission");
  const vision = aboutSections.find((s) => s.section === "vision");

  const headerTitle = getPageBlockTitle(blocks, "page_header", loc, t("title"));
  const headerSubtitle = getPageBlockSubtitle(blocks, "page_header", loc, t("subtitle"));
  const headerLead = headerSubtitle || headerTitle;

  return (
    <div className="bg-linear-to-b from-violet-50/50 via-white to-blue-50/40">
      <PageHeader
        title={headerTitle}
        subtitle={headerLead}
        variant="about"
        promoteSubtitle
        backgroundColor={settings.page_header_about_bg}
      />
      <TimelineSection
        title={getPageBlockTitle(blocks, "timeline_section", loc, t("timeline_title"))}
        items={timeline}
        locale={loc}
      />
      <ActivitiesSection
        title={getPageBlockTitle(blocks, "activities_section", loc, t("activities_title"))}
        items={activities}
        locale={loc}
      />

      {(mission || vision) && (
        <PageSection>
          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            {mission && (
              <article className="content-block">
                <h2 className="text-xl font-bold text-primary-theme md:text-2xl">{t("mission")}</h2>
                <p className="content-prose-tight mt-3 whitespace-pre-line">
                  {getLocalizedField(mission, "content", loc)}
                </p>
              </article>
            )}
            {vision && (
              <article className="content-block">
                <h2 className="text-xl font-bold text-primary-theme md:text-2xl">{t("vision")}</h2>
                <p className="content-prose-tight mt-3 whitespace-pre-line">
                  {getLocalizedField(vision, "content", loc)}
                </p>
              </article>
            )}
          </div>
        </PageSection>
      )}

      <CoreValuesGrid title={t("values_title")} items={coreValues} locale={loc} />
      <VietnamMap
        title={getPageBlockTitle(blocks, "branches_section", loc, t("branches_title"))}
        branches={branches}
        locale={loc}
      />
      <FoundersGrid title={t("founders_title")} founders={founders} locale={loc} />

      <PageSection muted>
        <h2 className="mb-6 text-center text-2xl font-bold text-heading md:text-3xl">{t("why_japan_title")}</h2>
        <WhyChooseUs items={whyItems} locale={loc} />
      </PageSection>
      <ScrollToTopButton />
    </div>
  );
}
