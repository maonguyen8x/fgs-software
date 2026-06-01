"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { TypewriterText } from "@/components/ui/TypewriterText";

interface HeroSectionProps {
  headline: string;
  subheadline: string;
  typewriterEnabled?: boolean;
  typewriterTarget?: "headline" | "subheadline";
}

export function HeroSection({
  headline,
  subheadline,
  typewriterEnabled = true,
  typewriterTarget = "subheadline",
}: HeroSectionProps) {
  const t = useTranslations("hero");
  const locale = useLocale();

  return (
    <section className="page-hero relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary-200/30 via-transparent to-transparent" />
      <div className="container-narrow relative section-padding">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h1 className="page-title text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
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
              className="mt-6 text-lg text-slate-600 md:text-xl"
              speedMs={62}
            />
          ) : (
            <p className="mt-6 text-lg text-slate-600 md:text-xl">{subheadline}</p>
          )}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <Link href={`/${locale}/contact`}>
                {t("cta_contact")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={`/${locale}/works`}>{t("cta_works")}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
