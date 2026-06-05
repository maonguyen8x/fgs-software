"use client";

import { useTranslations } from "next-intl";
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
    <section className="team-flow-section team-flow-section--balanced">
      <div className="team-page-inner">
        <article className="team-page-panel px-6 py-6 md:px-8 md:py-8">
          <TeamSectionHeading icon={Heart} title={t("section_title")} className="team-section-heading max-w-none" />
          <p className="text-left text-lg font-bold leading-snug text-slate-900 md:text-xl">
            {t("intro_headline")}
          </p>
          <p className="mt-3 text-left text-base font-normal leading-relaxed text-slate-700 md:text-lg">
            {t("intro_body")}
          </p>

          <div className="team-grid-tight mt-5 grid md:grid-cols-3">
            {PILLARS.map(({ key, icon: Icon }) => (
              <article
                key={key}
                className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-left text-lg font-bold text-slate-900">{t(`${key}_title`)}</h3>
                <p className="mt-2 flex-1 text-left text-base leading-relaxed text-slate-600">
                  {t(`${key}_body`)}
                </p>
              </article>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
