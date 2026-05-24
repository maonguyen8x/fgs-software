import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { HeroSection } from "@/components/sections/HeroSection";
import { StatsBar } from "@/components/sections/StatsBar";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { TeamGrid } from "@/components/sections/TeamGrid";
import { WorksGrid } from "@/components/sections/WorksGrid";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { fetchHomePageData } from "@/lib/cache/safe-home-data";
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
  const { settings, stats, allServices, whyItems, allTeam, allWorks, testimonials, partners } =
    await fetchHomePageData();
  const services = allServices.slice(0, 4);
  const team = allTeam.slice(0, 4);
  const works = allWorks.filter((w) => w.featured).slice(0, 3);

  const headline = getSettingValue(settings, "hero_headline", loc);
  const subheadline = getSettingValue(settings, "hero_subheadline", loc);

  return (
    <>
      <HeroSection headline={headline} subheadline={subheadline} />
      {stats.length > 0 && <StatsBar stats={stats} locale={loc} />}

      <section className="section-padding">
        <div className="container-narrow">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-heading">{t("services_title")}</h2>
            <p className="mt-2 text-muted-theme">{t("services_subtitle")}</p>
          </div>
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

      <section className="section-padding bg-surface-muted">
        <div className="container-narrow">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-heading">{t("why_title")}</h2>
            <p className="mt-2 text-muted-theme">{t("why_subtitle")}</p>
          </div>
          <WhyChooseUs items={whyItems} locale={loc} />
        </div>
      </section>

      {team.length > 0 && (
        <section className="section-padding">
          <div className="container-narrow">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold text-heading">{t("team_title")}</h2>
                <p className="mt-2 text-muted-theme">{t("team_subtitle")}</p>
              </div>
              <Button asChild variant="ghost">
                <Link href={`/${locale}/team`}>{t("view_all")} →</Link>
              </Button>
            </div>
            <TeamGrid members={team} locale={loc} yearsLabel={(await getTranslations("team"))("years")} />
          </div>
        </section>
      )}

      {works.length > 0 && (
        <section className="section-padding bg-surface-muted">
          <div className="container-narrow">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold text-heading">{t("works_title")}</h2>
                <p className="mt-2 text-muted-theme">{t("works_subtitle")}</p>
              </div>
              <Button asChild variant="ghost">
                <Link href={`/${locale}/works`}>{t("view_all")} →</Link>
              </Button>
            </div>
            <WorksGrid works={works} locale={loc} viewLabel={(await getTranslations("works"))("view_details")} />
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="section-padding">
          <div className="container-narrow">
            <h2 className="mb-8 text-center text-3xl font-bold text-heading">{t("testimonials_title")}</h2>
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
        title={t("partners_title")}
        subtitle={t("partners_subtitle")}
        partners={partners}
        locale={loc}
      />

      <CtaBanner
        title={t("cta_title")}
        subtitle={t("cta_subtitle")}
        buttonLabel={t("cta_button")}
        href={`/${locale}/contact`}
      />
    </>
  );
}