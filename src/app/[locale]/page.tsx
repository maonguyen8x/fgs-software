import { setRequestLocale } from "next-intl/server";
import { HomeCodeGeneExperience } from "@/components/home/codegene/HomeCodeGeneExperience";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { fetchHomePageData } from "@/lib/cache/safe-home-data";
import type { Locale } from "@/i18n/routing";
import { fetchPageBlockMap } from "@/lib/cache/safe-page-blocks";
import { getPageBlockBody, getPageBlockSubtitle, getPageBlockTitle } from "@/lib/page-content";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [{ allServices, allWorks, techStack, settings }, blocks, servicesBlocks] = await Promise.all([
    fetchHomePageData(),
    fetchPageBlockMap("home"),
    fetchPageBlockMap("services"),
  ]);
  const loc = locale as Locale;
  const managedTechStack = Object.values(servicesBlocks)
    .filter((block) => block.key.startsWith("technology_"))
    .map((block) => ({
      id: block.id,
      name: getPageBlockTitle(servicesBlocks, block.key, loc, ""),
      category: getPageBlockBody(servicesBlocks, block.key, loc, ""),
      logoUrl: null,
      order: block.order,
      isVisible: true,
    }))
    .filter((item) => item.name && ["frontend", "backend", "mobile", "database", "devops", "tools"].includes(item.category));
  const chapterCopy = Object.fromEntries(
    [1, 2, 3, 4, 5].map((number) => {
      const suffix = `0${number}`;
      return [
        `chapter-${suffix}`,
        {
          title: getPageBlockTitle(blocks, `chapter_${suffix}`, loc, ""),
          subtitle: getPageBlockSubtitle(blocks, `chapter_${suffix}`, loc, ""),
        },
      ];
    })
  );
  const aiTechnologies = Object.values(blocks)
    .filter((block) => block.key.startsWith("ai_technology_"))
    .sort((left, right) => left.order - right.order)
    .map((block) => ({
      name: block.title || "",
      icon: block.subtitle || "Sparkles",
      color: block.body || "text-violet-300",
    }))
    .filter((item) => item.name);
  const getOrbitTechnologies = (prefix: string) =>
    Object.values(blocks)
      .filter((block) => block.key.startsWith(prefix))
      .sort((left, right) => left.order - right.order)
      .map((block) => ({ name: block.title || "", icon: block.subtitle || "Sparkles" }))
      .filter((item) => item.name);

  return (
    <div className="bg-theme">
      <HomeCodeGeneExperience
        services={allServices.filter((service) => service.order < 101)}
        techStack={servicesBlocks.technology_control ? managedTechStack : techStack}
        products={allWorks.filter((work) => work.category === "ai").slice(0, 3)}
        heroCopy={{
          eyebrow: getPageBlockTitle(blocks, "hero_eyebrow", loc, ""),
          title: getPageBlockTitle(blocks, "hero_section", loc, ""),
          subtitle: getPageBlockSubtitle(blocks, "hero_section", loc, ""),
        }}
        chapterCopy={chapterCopy}
        outerOrbitTech={
          blocks.tech_orbit_control
            ? getOrbitTechnologies("orbit_outer_")
            : undefined
        }
        innerOrbitTech={
          blocks.tech_orbit_control
            ? getOrbitTechnologies("orbit_inner_")
            : undefined
        }
        aiTechnologies={
          blocks.ai_technologies_control ? aiTechnologies : undefined
        }
        aiTechnologiesTitle={getPageBlockTitle(blocks, "ai_technologies_title", loc, "")}
        productsCopy={{
          eyebrow: getPageBlockTitle(blocks, "ai_products_eyebrow", loc, ""),
          title: getPageBlockTitle(blocks, "ai_products_section", loc, ""),
          subtitle: getPageBlockSubtitle(blocks, "ai_products_section", loc, ""),
        }}
        companyName={settings.company_name ?? "FGS Software"}
        locale={loc}
      />
      <ScrollToTopButton />
    </div>
  );
}
