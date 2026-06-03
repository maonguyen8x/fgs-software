"use client";

import { useTranslations } from "next-intl";
import { TypewriterText } from "@/components/ui/TypewriterText";
import {
  ExploreAiVisualColumn,
  ExploreFutureBackdrop,
  ExploreTechPills,
} from "@/components/home/ExploreFutureBackdrop";
import { HOME_HASH_EXPLORE } from "@/lib/home-hash";

export function HomeExploreSection() {
  const t = useTranslations("home.explore");

  return (
    <section
      id={HOME_HASH_EXPLORE}
      className="home-explore-section relative min-h-0 overflow-hidden scroll-mt-0 py-14 md:py-16 lg:py-[4.5rem]"
      aria-labelledby="home-explore-heading"
    >
      <ExploreFutureBackdrop />

      <div className="container-narrow relative z-10 px-4">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <div className="flex flex-col justify-center text-center lg:text-left">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary-600 dark:text-primary-400">
              <TypewriterText text={t("eyebrow")} speedMs={42} startDelayMs={200} />
            </p>

            <h2
              id="home-explore-heading"
              className="page-title min-h-[1.2em] text-2xl font-bold tracking-tight md:text-3xl lg:text-[2.35rem] lg:leading-tight"
            >
              <TypewriterText
                text={t("default_title")}
                as="span"
                className="text-gradient"
                speedMs={48}
                startDelayMs={900}
              />
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 md:text-base lg:mx-0 dark:text-slate-300">
              <TypewriterText text={t("default_subtitle")} as="span" speedMs={36} startDelayMs={2200} />
            </p>

            <ExploreTechPills />
          </div>

          <div className="flex items-center justify-center px-2 lg:max-h-[min(52vh,380px)]">
            <div className="w-full max-w-[min(100%,300px)] scale-90 md:max-w-[340px] md:scale-95 lg:max-w-none lg:scale-100">
              <ExploreAiVisualColumn />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
