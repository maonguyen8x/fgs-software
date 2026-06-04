"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Heart, Lightbulb, Rocket, Users } from "lucide-react";
import { TeamSectionHeading } from "@/components/team/TeamSectionHeading";

const PILLARS = [
  { key: "innovation" as const, icon: Lightbulb },
  { key: "ownership" as const, icon: Users },
  { key: "growth" as const, icon: Rocket },
];

export function TeamCultureSection() {
  const t = useTranslations("team.culture");

  return (
    <section className="team-flow-section bg-slate-50/80 dark:bg-slate-900/40">
      <div className="container-narrow">
        <TeamSectionHeading icon={Heart} title={t("section_title")} />
        <div className="max-w-3xl text-left">
          <p className="text-left text-lg font-bold leading-snug text-slate-900 md:text-xl dark:text-white">
            {t("intro_headline")}
          </p>
          <p className="mt-3 text-left text-base font-normal leading-relaxed text-slate-700 md:text-lg dark:text-slate-300">
            {t("intro_body")}
          </p>
        </div>

        <div className="mt-5 grid max-w-4xl gap-3 md:grid-cols-3 md:gap-4">
          {PILLARS.map(({ key, icon: Icon }, index) => (
            <motion.article
              key={key}
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.4, delay: index * 0.07 }}
              className="rounded-2xl border border-slate-200/90 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-300">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-left text-lg font-bold text-slate-900 dark:text-white">{t(`${key}_title`)}</h3>
              <p className="mt-2 text-left text-base leading-relaxed text-slate-600 dark:text-slate-400">
                {t(`${key}_body`)}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
