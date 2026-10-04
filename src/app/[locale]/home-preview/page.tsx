import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { HomeClientsMarquee } from "@/components/home/HomeClientsMarquee";
import { HomeSectionHeading } from "@/components/home/HomeSectionHeading";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { TechStackSection } from "@/components/sections/TechStackSection";
import { WhyChooseUs } from "@/components/sections/WhyChooseUs";
import { WorksGrid } from "@/components/sections/WorksGrid";
import { CONSULTATION_FORM_URL } from "@/config/consultation-form";
import { getCachedTechStack } from "@/lib/cache/queries";
import { fetchHomePageData } from "@/lib/cache/safe-home-data";
import { fetchPageBlockMap } from "@/lib/cache/safe-page-blocks";
import { getPageBlockSubtitle, getPageBlockTitle } from "@/lib/page-content";
import { resolveHomeClientsCopy } from "@/lib/home-clients-copy";
import { sanitizeHomeSectionSubtitle } from "@/lib/home-section-copy";
import type { Locale } from "@/i18n/routing";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const TECH_CATEGORIES = ["frontend", "backend", "mobile", "database", "devops", "tools"] as const;

export default async function HomePreviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tHero = await getTranslations("hero");
  const tServices = await getTranslations("services");
  const loc = locale as Locale;

  const [{ settings, whyItems, partners, allServices, allWorks }, blocks, techStack] =
    await Promise.all([fetchHomePageData(), fetchPageBlockMap("home"), getCachedTechStack()]);

  const clientsCopy = resolveHomeClientsCopy(settings, loc, {
    title: t("clients.default_title"),
    subtitle: t("clients.default_subtitle"),
  });

  const featuredWorks = allWorks.slice(0, 3);

  return (
    <div className="bg-theme">
      <p className="bg-amber-50 px-4 py-2 text-center text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
        Bản đề xuất bố cục trang chủ — không phải trang chính thức.
      </p>

      <section className="relative flex min-h-[min(84vh,780px)] items-center justify-center overflow-hidden">
        <Image
          src="/images/hero-office.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/60 to-slate-950/75"
          aria-hidden
        />
        <div className="container-narrow relative z-10 px-4 py-24 text-center text-white">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-300">
            {settings.company_name || "FGS Software"}
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-bold leading-tight drop-shadow-md md:text-4xl lg:text-5xl">
            {tHero("tagline")}
          </h1>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={`/${loc}/contact`}>{tHero("cta_contact")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/70 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
            >
              <Link href={`/${loc}/services#products`}>{tHero("cta_works")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {allServices.length > 0 && (
        <section className="home-section section-padding">
          <div className="container-narrow">
            <HomeSectionHeading
              title={getPageBlockTitle(blocks, "services_section", loc, t("services_title"))}
              subtitle={sanitizeHomeSectionSubtitle(
                getPageBlockSubtitle(blocks, "services_section", loc, t("services_subtitle")) ?? ""
              )}
            />
            <ServicesGrid
              services={allServices}
              locale={loc}
              consultationHref={CONSULTATION_FORM_URL}
              learnMoreLabel={tServices("contact_cta")}
              formBadgeLabel={tServices("contact_cta_form_badge")}
            />
          </div>
        </section>
      )}

      {techStack.length > 0 && (
        <TechStackSection
          title={getPageBlockTitle(blocks, "tech_section", loc, tServices("tech_title"))}
          subtitle={getPageBlockSubtitle(blocks, "tech_section", loc, tServices("tech_subtitle"))}
          items={techStack}
          categories={TECH_CATEGORIES}
        />
      )}

      {featuredWorks.length > 0 && (
        <section className="home-section section-padding">
          <div className="container-narrow">
            <HomeSectionHeading
              title={getPageBlockTitle(blocks, "works_section", loc, t("works_title"))}
              subtitle={sanitizeHomeSectionSubtitle(
                getPageBlockSubtitle(blocks, "works_section", loc, t("works_subtitle")) ?? ""
              )}
            />
            <WorksGrid works={featuredWorks} locale={loc} viewLabel={t("view_all")} />
            <div className="mt-10 text-center">
              <Button asChild variant="outline" size="lg">
                <Link href={`/${loc}/services#products`}>{t("view_all")}</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="home-section home-section-muted section-padding">
        <div className="container-narrow">
          <HomeSectionHeading
            title={getPageBlockTitle(blocks, "why_section", loc, t("why_title"))}
            subtitle={sanitizeHomeSectionSubtitle(
              getPageBlockSubtitle(blocks, "why_section", loc, t("why_subtitle")) ?? ""
            )}
          />
          <WhyChooseUs items={whyItems} locale={loc} />
        </div>
      </section>

      <HomeClientsMarquee
        partners={partners}
        locale={loc}
        title={clientsCopy.title}
        subtitle={clientsCopy.subtitle}
      />

      <CtaBanner
        title={t("cta_title")}
        subtitle={t("cta_subtitle")}
        buttonLabel={t("cta_button")}
        href={`/${loc}/contact`}
      />
      <ScrollToTopButton home />
    </div>
  );
}
