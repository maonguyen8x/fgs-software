"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { TypewriterText } from "@/components/ui/TypewriterText";
import { NeuralNetworkBackdrop } from "@/components/home/NeuralNetworkBackdrop";
import { HomeHeroVisual } from "@/components/home/HomeHeroVisual";

interface HomeHeroSectionProps {
  headline: string;
  subheadline: string;
  typewriterEnabled?: boolean;
  typewriterTarget?: "headline" | "subheadline";
}

export function HomeHeroSection({
  headline,
  subheadline,
  typewriterEnabled = true,
  typewriterTarget = "subheadline",
}: HomeHeroSectionProps) {
  const t = useTranslations("hero");
  const locale = useLocale();

  return (
    <section className="home-hero relative min-h-[min(88vh,920px)] overflow-hidden">
      <NeuralNetworkBackdrop />
      <div className="container-narrow relative z-10 flex min-h-[min(88vh,920px)] flex-col justify-center section-padding pb-16 pt-12 md:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <motion.span
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-200/80 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-700 shadow-sm backdrop-blur-sm dark:border-primary-800 dark:bg-slate-900/60 dark:text-primary-300"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-500" />
              FGS Software · AI & Engineering
            </motion.span>

            <h1 className="page-title text-4xl font-bold tracking-tight md:text-5xl lg:text-[3.25rem] lg:leading-tight">
              {typewriterEnabled && typewriterTarget === "headline" ? (
                <TypewriterText
                  text={headline}
                  className="text-gradient min-h-[1.25em]"
                  speedMs={55}
                />
              ) : (
                <span className="text-gradient">{headline}</span>
              )}
            </h1>

            {typewriterEnabled && typewriterTarget === "subheadline" ? (
              <TypewriterText
                text={subheadline}
                className="mx-auto mt-6 max-w-xl text-lg text-slate-600 md:text-xl lg:mx-0 dark:text-slate-300"
                speedMs={62}
              />
            ) : (
              <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600 md:text-xl lg:mx-0 dark:text-slate-300">
                {subheadline}
              </p>
            )}

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Button asChild size="lg" className="shadow-lg shadow-primary-600/25">
                <Link href={`/${locale}/contact`}>
                  {t("cta_contact")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary-200/80 bg-white/60 backdrop-blur-sm">
                <Link href={`/${locale}/works`}>{t("cta_works")}</Link>
              </Button>
            </div>
          </motion.div>

          <div className="hidden lg:block">
            <HomeHeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}
