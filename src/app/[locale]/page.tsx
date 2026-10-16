import { setRequestLocale } from "next-intl/server";
import { HomeCodeGeneExperience } from "@/components/home/codegene/HomeCodeGeneExperience";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { fetchHomePageData } from "@/lib/cache/safe-home-data";
import type { Locale } from "@/i18n/routing";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { allServices, techStack, settings } = await fetchHomePageData();

  return (
    <div className="bg-theme">
      <HomeCodeGeneExperience
        services={allServices.filter((service) => service.order < 101)}
        techStack={techStack}
        companyName={settings.company_name ?? "FGS Software"}
        locale={locale as Locale}
      />
      <ScrollToTopButton />
    </div>
  );
}
