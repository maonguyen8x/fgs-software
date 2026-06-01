import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { HomeHeroSection } from "@/components/home/HomeHeroSection";
import { HomeSectionHeading } from "@/components/home/HomeSectionHeading";
import { StatsBar } from "@/components/sections/StatsBar";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { TeamGrid } from "@/components/sections/TeamGrid";
import { WorksGrid } from "@/components/sections/WorksGrid";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { fetchHomePageData } from "@/lib/cache/safe-home-data";
import { fetchPageBlockMap } from "@/lib/cache/safe-page-blocks";
import { getPageBlockSubtitle, getPageBlockTitle } from "@/lib/page-content";
import { PartnersSection } from "@/components/sections/PartnersSection";
import { getSettingValue, getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const loc = locale as Locale;
  const [{ settings, stats, allServices, whyItems, allTeam, allWorks, testimonials, partners }, blocks] =
    await Promise.all([fetchHomePageData(), fetchPageBlockMap("home")]);
  const services = allServices.slice(0, 4);
  const team = allTeam.slice(0, 4);
  const works = allWorks.filter((w) => w.featured).slice(0, 3);
  const legacyTaglines = new Set([
    "Đối tác Outsourcing IT đáng tin cậy tại Việt Nam",
    "Your trusted IT outsourcing partner in Vietnam",
    "ベトナムの信頼できるITアウトソーシングパートナー",
  ]);

  const th = await getTranslations("hero");
  const headline = getSettingValue(settings, "hero_headline", loc);
  const subheadlineRaw =
    getSettingValue(settings, "hero_subheadline", loc) ||
    getSettingValue(settings, "site_tagline", loc) ||
    th("tagline");
  const subheadline = legacyTaglines.has(subheadlineRaw)
    ? th("tagline")
    : subheadlineRaw;
  const typewriterTarget: "headline" | "subheadline" = legacyTaglines.has(headline)
    ? "headline"
    : "subheadline";
  const typewriterEnabled = (settings.hero_typewriter_enabled ?? "true") !== "false";

  return (
    <div className="bg-theme">
      <HomeHeroSection
        headline={headline}
        subheadline={subheadline}
        typewriterEnabled={typewriterEnabled}
        typewriterTarget={typewriterTarget}
      />
      {stats.length > 0 && <StatsBar stats={stats} locale={loc} />}

      <section className="home-section section-padding">
        <div className="container-narrow">
          <HomeSectionHeading
            title={getPageBlockTitle(blocks, "services_section", loc, t("services_title"))}
            subtitle={getPageBlockSubtitle(blocks, "services_section", loc, t("services_subtitle"))}
          />
          <ServicesGrid
            services={services}
            locale={loc}
            contactHref={`/${locale}/contact`}
            learnMoreLabel={t("view_all")}
          />
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link href={`/${locale}/services`}>{t("view_all")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="home-section home-section-muted section-padding">
        <div className="container-narrow">
          <HomeSectionHeading
            title={getPageBlockTitle(blocks, "why_section", loc, t("why_title"))}
            subtitle={getPageBlockSubtitle(blocks, "why_section", loc, t("why_subtitle"))}
          />
          <WhyChooseUs items={whyItems} locale={loc} />
        </div>
      </section>

      {team.length > 0 && (
        <section className="home-section section-padding">
          <div className="container-narrow">
            <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <HomeSectionHeading
                align="left"
                title={getPageBlockTitle(blocks, "team_section", loc, t("team_title"))}
                subtitle={getPageBlockSubtitle(blocks, "team_section", loc, t("team_subtitle"))}
              />
              <Button asChild variant="ghost">
                <Link href={`/${locale}/team`}>{t("view_all")} →</Link>
              </Button>
            </div>
            <TeamGrid
              members={team}
              locale={loc}
              yearsLabel={(await getTranslations("team"))("years")}
              detailCloseLabel={(await getTranslations("team"))("detail_close")}
            />
          </div>
        </section>
      )}

      {works.length > 0 && (
        <section className="home-section home-section-muted section-padding">
          <div className="container-narrow">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <HomeSectionHeading
                align="left"
                title={getPageBlockTitle(blocks, "works_section", loc, t("works_title"))}
                subtitle={getPageBlockSubtitle(blocks, "works_section", loc, t("works_subtitle"))}
              />
              <Button asChild variant="ghost">
                <Link href={`/${locale}/works`}>{t("view_all")} →</Link>
              </Button>
            </div>
            <WorksGrid works={works} locale={loc} viewLabel={(await getTranslations("works"))("view_details")} />
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="home-section section-padding">
          <div className="container-narrow">
            <HomeSectionHeading
              title={getPageBlockTitle(blocks, "testimonials_section", loc, t("testimonials_title"))}
            />
            <div className="grid gap-4 md:grid-cols-3 md:gap-5">
              {testimonials.map((item) => (
                <blockquote key={item.id} className="content-block">
                  <p className="text-muted-theme italic">&ldquo;{getLocalizedField(item, "quote", loc)}&rdquo;</p>
                  <footer className="mt-3 font-semibold text-heading">{item.author}</footer>
                  {item.company && (
                    <p className="text-sm text-muted-theme">{getLocalizedField(item, "company", loc) || item.company}</p>
                  )}
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      <PartnersSection
        title={getPageBlockTitle(blocks, "partners_section", loc, t("partners_title"))}
        subtitle={getPageBlockSubtitle(blocks, "partners_section", loc, t("partners_subtitle"))}
        partners={partners}
        locale={loc}
      />

      <CtaBanner
        title={getPageBlockTitle(blocks, "cta_section", loc, t("cta_title"))}
        subtitle={getPageBlockSubtitle(blocks, "cta_section", loc, t("cta_subtitle"))}
        buttonLabel={t("cta_button")}
        href={`/${locale}/contact`}
      />
    </div>
  );
}