"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ConceptProductsSection } from "@/components/about/ConceptProductsSection";
import { HomeTechHero } from "@/components/home/codegene/HomeTechHero";
import { HomeAiTechMarquee, type HomeAiTechnology } from "@/components/home/codegene/HomeAiTechMarquee";
import { HomeChapterRail } from "@/components/home/codegene/HomeChapterRail";
import {
  HomeChapterPanels,
  type HomeChapterCopy,
  type HomeOrbitTechnology,
  type HomeServiceItem,
} from "@/components/home/codegene/HomeChapterPanels";
import {
  HOME_CHAPTER_IDS,
  HOME_HASH_HERO,
  type HomeChapterId,
} from "@/lib/home-chapters";
import type { Locale } from "@/i18n/routing";
import type { TechStack, Work } from "@prisma/client";
import { getLocalizedField } from "@/lib/i18n-content";

interface HomeCodeGeneExperienceProps {
  services: HomeServiceItem[];
  techStack: TechStack[];
  products: Work[];
  heroCopy?: { eyebrow?: string; title?: string; subtitle?: string };
  chapterCopy?: Partial<Record<HomeChapterId, HomeChapterCopy>>;
  outerOrbitTech?: HomeOrbitTechnology[];
  innerOrbitTech?: HomeOrbitTechnology[];
  aiTechnologies?: HomeAiTechnology[];
  aiTechnologiesTitle?: string;
  productsCopy?: { eyebrow?: string; title?: string; subtitle?: string };
  companyName: string;
  locale: Locale;
}

const OBSERVED_IDS = [HOME_HASH_HERO, ...HOME_CHAPTER_IDS] as const;

export function HomeCodeGeneExperience({
  services,
  techStack,
  products,
  heroCopy,
  chapterCopy,
  outerOrbitTech,
  innerOrbitTech,
  aiTechnologies,
  aiTechnologiesTitle,
  productsCopy,
  companyName,
  locale,
}: HomeCodeGeneExperienceProps) {
  const t = useTranslations("about.concept_products");
  const works = useTranslations("works");
  const [activeChapter, setActiveChapter] = useState<HomeChapterId>("chapter-01");

  const scrollToChapter = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const elements = OBSERVED_IDS.map((id) => document.getElementById(id)).filter(
      Boolean
    ) as HTMLElement[];

    if (elements.length === 0) return;

    let raf = 0;

    const pickActive = () => {
      const marker = window.innerHeight * 0.38;
      let best: { id: HomeChapterId; score: number } | null = null;

      for (const el of elements) {
        if (el.id === HOME_HASH_HERO) continue;
        if (!HOME_CHAPTER_IDS.includes(el.id as HomeChapterId)) continue;
        const rect = el.getBoundingClientRect();
        if (rect.bottom < marker * 0.5 || rect.top > window.innerHeight * 0.92) continue;
        const score = -Math.abs(rect.top - marker);
        if (!best || score > best.score) {
          best = { id: el.id as HomeChapterId, score };
        }
      }

      if (best) setActiveChapter(best.id);
    };

    const observer = new IntersectionObserver(
      () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(pickActive);
      },
      { threshold: [0, 0.12, 0.28, 0.45], rootMargin: "-20% 0px -45% 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    window.addEventListener("scroll", pickActive, { passive: true });
    pickActive();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("scroll", pickActive);
    };
  }, []);

  return (
    <div className="home-codegene">
      <HomeTechHero copy={heroCopy} />
      <HomeAiTechMarquee title={aiTechnologiesTitle} items={aiTechnologies} />

      <div className="home-chapters-wrap relative bg-[#fafafa] dark:bg-slate-950">
        <div className="home-chapters-grid pointer-events-none absolute inset-0 opacity-[0.45]" aria-hidden />
        <div className="container-narrow relative px-4 pb-20 pt-10 md:pt-12">
          <div className="grid gap-8 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)] lg:gap-10">
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <HomeChapterRail activeId={activeChapter} onNavigate={scrollToChapter} />
              </div>
            </div>
            <div className="min-w-0">
              <HomeChapterPanels
                services={services}
                techStack={techStack}
                companyName={companyName}
                locale={locale}
                chapterCopy={chapterCopy}
                outerOrbitTech={outerOrbitTech}
                innerOrbitTech={innerOrbitTech}
              />
            </div>
          </div>
        </div>
      </div>
      <ConceptProductsSection
        eyebrow={productsCopy?.eyebrow || t("eyebrow")}
        title={productsCopy?.title || t("title")}
        subtitle={productsCopy?.subtitle || t("subtitle")}
        productLabel={works("ai_product_label")}
        products={products.map((product) => ({
          id: product.id,
          title: getLocalizedField(product, "title", locale),
          description: getLocalizedField(product, "summary", locale),
          features: product.techStack,
          appUrl: product.demoUrl,
        }))}
      />
    </div>
  );
}
