import { getTranslations, setRequestLocale } from "next-intl/server";
import { HomeHeroExperience } from "@/components/home/HomeHeroExperience";
import { HomeExploreSection } from "@/components/home/HomeExploreSection";
import { HomeClientsMarquee } from "@/components/home/HomeClientsMarquee";
import { HomeHashSync } from "@/components/home/HomeHashSync";
import { getCachedHeroScrollSlides } from "@/lib/cache/queries";
import { resolveHeroScrollSlides } from "@/lib/hero-scroll-slides";
import { resolveHeroDisplayCopy } from "@/lib/hero-copy";
import { resolveHomeClientsCopy } from "@/lib/home-clients-copy";
import { sanitizeHomeSectionSubtitle } from "@/lib/home-section-copy";
import { HomeSectionHeading } from "@/components/home/HomeSectionHeading";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { fetchHomePageData } from "@/lib/cache/safe-home-data";
import { fetchPageBlockMap } from "@/lib/cache/safe-page-blocks";
import { getPageBlockSubtitle, getPageBlockTitle } from "@/lib/page-content";
import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const loc = locale as Locale;
  const [{ settings, whyItems, testimonials, partners }, blocks, heroSlideRows] = await Promise.all([
    fetchHomePageData(),
    fetchPageBlockMap("home"),
    getCachedHeroScrollSlides(),
  ]);
  const heroSlides = resolveHeroScrollSlides(heroSlideRows);
  const heroCopy = resolveHeroDisplayCopy(settings, loc);
  const clientsCopy = resolveHomeClientsCopy(settings, loc, {
    title: t("clients.default_title"),
    subtitle: t("clients.default_subtitle"),
  });

  const whySubtitle = sanitizeHomeSectionSubtitle(
    getPageBlockSubtitle(blocks, "why_section", loc, t("why_subtitle")) ?? ""
  );

  return (
    <div className="bg-theme">
      <HomeHashSync />
      <HomeHeroExperience slides={heroSlides} copy={heroCopy} />
      <HomeExploreSection />
      <HomeClientsMarquee
        partners={partners}
        locale={loc}
        title={clientsCopy.title}
        subtitle={clientsCopy.subtitle}
      />

      <section className="home-section home-section-muted section-padding">
        <div className="container-narrow">
          <HomeSectionHeading
            title={getPageBlockTitle(blocks, "why_section", loc, t("why_title"))}
            subtitle={whySubtitle}
          />
          <WhyChooseUs items={whyItems} locale={loc} />
        </div>
      </section>

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
    </div>
  );
}
