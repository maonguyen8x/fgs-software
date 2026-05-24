import { getTranslations, setRequestLocale } from "next-intl/server";
import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSection } from "@/components/layout/PageSection";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { TimelineSection } from "@/components/about/TimelineSection";
import { CoreValuesGrid } from "@/components/about/CoreValuesGrid";
import { VietnamMap } from "@/components/about/VietnamMap";
import { FoundersGrid } from "@/components/about/FoundersGrid";
import { fetchAboutPageData } from "@/lib/cache/safe-about-data";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const loc = locale as Locale;

  const { aboutSections, timeline, coreValues, branches, founders, whyItems } =
    await fetchAboutPageData();

  const mission = aboutSections.find((s) => s.section === "mission");
  const vision = aboutSections.find((s) => s.section === "vision");

  return (
    <div>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <TimelineSection title={t("timeline_title")} items={timeline} locale={loc} />

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
      <VietnamMap title={t("branches_title")} branches={branches} locale={loc} />
      <FoundersGrid title={t("founders_title")} founders={founders} locale={loc} />

      <PageSection muted>
        <h2 className="mb-6 text-center text-2xl font-bold text-heading md:text-3xl">{t("why_japan_title")}</h2>
        <WhyChooseUs items={whyItems} locale={loc} />
      </PageSection>
    </div>
  );
}
