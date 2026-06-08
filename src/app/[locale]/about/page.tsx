import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSection } from "@/components/layout/PageSection";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { TimelineSection } from "@/components/about/TimelineSection";
import { ActivitiesSection } from "@/components/about/ActivitiesSection";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { CoreValuesGrid } from "@/components/about/CoreValuesGrid";
import { VietnamMap } from "@/components/about/VietnamMap";
import { AboutTechFocusSection } from "@/components/about/AboutTechFocusSection";
import { fetchAboutPageData } from "@/lib/cache/safe-about-data";
import { fetchPageBlockMap } from "@/lib/cache/safe-page-blocks";
import { getPageBlockSubtitle, getPageBlockTitle } from "@/lib/page-content";
import { getSettingsMapSafe } from "@/lib/settings-safe";
import { resolveAboutBranchHqAddress } from "@/lib/about-branch-copy";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const loc = locale as Locale;

  const [{ timeline, activities, coreValues, branches, whyItems }, blocks, settings] =
    await Promise.all([fetchAboutPageData(), fetchPageBlockMap("about"), getSettingsMapSafe()]);

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

      <CoreValuesGrid title={t("values_title")} items={coreValues} locale={loc} />
      <AboutTechFocusSection />
      <VietnamMap
        title={getPageBlockTitle(blocks, "branches_section", loc, t("branches_title"))}
        branches={branches}
        locale={loc}
        hqAddress={resolveAboutBranchHqAddress(settings, loc, t("hq_address"))}
      />

      <PageSection muted tight className="!pt-3">
        <h2 className="about-emphasis-heading !pb-3 !pt-0">{t("why_japan_title")}</h2>
        <WhyChooseUs items={whyItems} locale={loc} />
      </PageSection>
      <ScrollToTopButton />
    </div>
  );
}
