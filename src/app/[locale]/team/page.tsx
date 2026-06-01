import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { getCachedTeam } from "@/lib/cache/queries";
import { fetchAboutPageData } from "@/lib/cache/safe-about-data";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSection } from "@/components/layout/PageSection";
import { TeamGrid } from "@/components/sections/TeamGrid";
import { CoreValuesGrid } from "@/components/about/CoreValuesGrid";
import { FoundersGrid } from "@/components/about/FoundersGrid";
import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import { getSettingsMapSafe } from "@/lib/settings-safe";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

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

  const [members, { aboutSections, coreValues, founders }, settings] = await Promise.all([
    getCachedTeam(true),
    fetchAboutPageData(),
    getSettingsMapSafe(),
  ]);

  const mission = aboutSections.find((s) => s.section === "mission");
  const vision = aboutSections.find((s) => s.section === "vision");
  const headerLead = t("subtitle") || t("title");

  return (
    <div className="bg-linear-to-b from-sky-50/50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <PageHeader
        title={t("title")}
        subtitle={headerLead}
        variant="team"
        promoteSubtitle
        backgroundColor={settings.page_header_team_bg}
      />

      <PageSection>
        <article className="content-block mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-heading md:text-3xl">{t("intro_title")}</h2>
          <p className="content-prose-tight mt-4 whitespace-pre-line">{t("intro_body")}</p>
        </article>
      </PageSection>

      {(mission || vision) && (
        <PageSection muted>
          <div className="grid gap-4 md:grid-cols-2 md:gap-5">
            {mission && (
              <article className="content-block">
                <h2 className="text-xl font-bold text-primary-theme md:text-2xl">{tAbout("mission")}</h2>
                <p className="content-prose-tight mt-3 whitespace-pre-line">
                  {getLocalizedField(mission, "content", loc)}
                </p>
              </article>
            )}
            {vision && (
              <article className="content-block">
                <h2 className="text-xl font-bold text-primary-theme md:text-2xl">{tAbout("vision")}</h2>
                <p className="content-prose-tight mt-3 whitespace-pre-line">
                  {getLocalizedField(vision, "content", loc)}
                </p>
              </article>
            )}
          </div>
        </PageSection>
      )}

      {coreValues.length > 0 && (
        <CoreValuesGrid title={tAbout("values_title")} items={coreValues} locale={loc} />
      )}

      {founders.length > 0 && (
        <FoundersGrid title={t("founders_title")} founders={founders} locale={loc} />
      )}

      {members.length > 0 && (
        <PageSection>
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-heading md:text-3xl">{t("members_title")}</h2>
            <p className="mt-2 text-muted-theme">{t("members_subtitle")}</p>
          </div>
          <TeamGrid
            members={members}
            locale={loc}
            yearsLabel={t("years")}
            detailCloseLabel={t("detail_close")}
          />
        </PageSection>
      )}

      <PageSection muted>
        <div className="content-block mx-auto flex max-w-3xl flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h2 className="text-xl font-bold text-heading md:text-2xl">{t("cta_about_title")}</h2>
            <p className="mt-2 text-sm text-muted-theme md:text-base">{t("cta_about_subtitle")}</p>
          </div>
          <Button asChild size="lg" variant="outline" className="shrink-0">
            <Link href={`/${locale}/about`}>
              {t("cta_about_button")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </PageSection>
    </div>
  );
}
