"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ConceptProductsSection } from "@/components/about/ConceptProductsSection";
import { HomeTechHero } from "@/components/home/codegene/HomeTechHero";
import { HomeAiTechMarquee } from "@/components/home/codegene/HomeAiTechMarquee";
import { HomeChapterRail } from "@/components/home/codegene/HomeChapterRail";
import {
  HomeChapterPanels,
  type HomeServiceItem,
} from "@/components/home/codegene/HomeChapterPanels";
import {
  HOME_CHAPTER_IDS,
  HOME_HASH_HERO,
  type HomeChapterId,
} from "@/lib/home-chapters";
import type { Locale } from "@/i18n/routing";
import type { TechStack } from "@prisma/client";

interface HomeCodeGeneExperienceProps {
  services: HomeServiceItem[];
  techStack: TechStack[];
  companyName: string;
  locale: Locale;
}

const OBSERVED_IDS = [HOME_HASH_HERO, ...HOME_CHAPTER_IDS] as const;

export function HomeCodeGeneExperience({
  services,
  techStack,
  companyName,
  locale,
}: HomeCodeGeneExperienceProps) {
  const t = useTranslations("about.concept_products");
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
      <HomeTechHero />
      <HomeAiTechMarquee />

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
              />
            </div>
          </div>
        </div>
      </div>
      <ConceptProductsSection
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        products={[
          {
            title: t("items.knowledge.title"),
            description: t("items.knowledge.description"),
          },
          {
            title: t("items.vision.title"),
            description: t("items.vision.description"),
          },
          {
            title: t("items.insights.title"),
            description: t("items.insights.description"),
          },
        ]}
      />
    </div>
  );
}
