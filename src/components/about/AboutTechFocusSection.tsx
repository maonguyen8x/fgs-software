"use client";

import { useTranslations } from "next-intl";
import {
  Brain,
  Cloud,
  Database,
  Link2,
  Cpu,
  Shield,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { PageSection } from "@/components/layout/PageSection";

const FOCUS_ITEMS: { key: string; icon: LucideIcon }[] = [
  { key: "ai", icon: Brain },
  { key: "iot", icon: Cpu },
  { key: "bigdata", icon: Database },
  { key: "blockchain", icon: Link2 },
  { key: "cloud", icon: Cloud },
  { key: "dx", icon: Sparkles },
  { key: "security", icon: Shield },
  { key: "automation", icon: Workflow },
];

export function AboutTechFocusSection() {
  const t = useTranslations("about.tech_focus");

  return (
    <PageSection tight>
      <h2 className="about-accent-heading">{t("title")}</h2>
      <p className="mx-auto max-w-2xl py-3 text-center text-sm leading-relaxed text-muted-theme">
        {t("subtitle")}
      </p>
      <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FOCUS_ITEMS.map(({ key, icon: Icon }) => (
          <article
            key={key}
            className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
          >
            <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/50">
              <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t(`${key}_title`)}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {t(`${key}_desc`)}
            </p>
          </article>
        ))}
      </div>
    </PageSection>
  );
}
