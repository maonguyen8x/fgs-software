import { getTranslations, setRequestLocale } from "next-intl/server";
import { fetchAboutPageData } from "@/lib/cache/safe-about-data";
import { PageSection } from "@/components/layout/PageSection";
import { CoreValuesGrid } from "@/components/about/CoreValuesGrid";
import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import { getSettingsMapSafe } from "@/lib/settings-safe";
import { TEAM_PAGE_HERO_IMAGE_KEY } from "@/lib/team-page-settings";
import { TeamPageHero } from "@/components/team/TeamPageHero";
import { TeamIntroBlocks } from "@/components/team/TeamIntroBlocks";
import { TeamCultureSection } from "@/components/team/TeamCultureSection";
import { LeadershipSection } from "@/components/team/LeadershipSection";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";

export default async function AboutUsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("team");
  const tAbout = await getTranslations("about");
  const loc = locale as Locale;

  const [{ aboutSections, coreValues, founders }, settings] = await Promise.all([
    fetchAboutPageData(),
    getSettingsMapSafe(),
  ]);

  const mission = aboutSections.find((s) => s.section === "mission");
  const vision = aboutSections.find((s) => s.section === "vision");
  const heroImage = settings[TEAM_PAGE_HERO_IMAGE_KEY];

  return (
    <div className="bg-linear-to-b from-sky-50/50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <TeamPageHero imageUrl={heroImage} />
      <LeadershipSection title={t("leadership_title")} founders={founders} />
      <TeamIntroBlocks />
      <TeamCultureSection />

      {(mission || vision) && (
        <PageSection muted className="team-flow-section !py-0">
          <div className="grid max-w-4xl gap-3 md:grid-cols-2 md:gap-4">
            {mission && (
              <article className="content-block text-left">
                <h2 className="text-xl font-bold text-primary-600 md:text-2xl dark:text-primary-400">{tAbout("mission")}</h2>
                <p className="mt-3 whitespace-pre-line text-left text-base font-medium leading-relaxed text-slate-700 md:text-lg dark:text-slate-300">
                  {getLocalizedField(mission, "content", loc)}
                </p>
              </article>
            )}
            {vision && (
              <article className="content-block text-left">
                <h2 className="text-xl font-bold text-primary-600 md:text-2xl dark:text-primary-400">{tAbout("vision")}</h2>
                <p className="mt-3 whitespace-pre-line text-left text-base font-medium leading-relaxed text-slate-700 md:text-lg dark:text-slate-300">
                  {getLocalizedField(vision, "content", loc)}
                </p>
              </article>
            )}
          </div>
        </PageSection>
      )}

      {coreValues.length > 0 && (
        <CoreValuesGrid title={tAbout("values_title")} items={coreValues} locale={loc} variant="team" />
      )}
      <ScrollToTopButton />
    </div>
  );
}
