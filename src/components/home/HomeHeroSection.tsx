"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
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
          <div className="animate-in-view text-center lg:text-left">
            <h1 className="page-title text-4xl font-bold tracking-tight md:text-5xl lg:text-[3.25rem] lg:leading-tight">
              {typewriterEnabled && typewriterTarget === "headline" ? (
                <TypewriterText
                  text={headline}
                  as="span"
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
                as="p"
                className="mx-auto mt-2.5 w-full text-base text-slate-600 md:text-lg lg:mx-0 dark:text-slate-300"
                speedMs={62}
              />
            ) : (
              <p className="mx-auto mt-2.5 w-full text-base text-slate-600 md:text-lg lg:mx-0 dark:text-slate-300">
                {subheadline}
              </p>
            )}

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
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
          </div>

          <div className="hidden lg:block">
            <HomeHeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}
