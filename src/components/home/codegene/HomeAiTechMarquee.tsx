"use client";

import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

const AI_TECHNOLOGIES = [
  { name: "Claude AI", icon: "BrainCircuit", color: "text-orange-300" },
  { name: "OpenAI", icon: "Orbit", color: "text-emerald-300" },
  { name: "ChatGPT", icon: "MessageCircle", color: "text-green-300" },
  { name: "GitHub Copilot", icon: "Github", color: "text-slate-100" },
  { name: "Google Gemini", icon: "Sparkles", color: "text-blue-300" },
  { name: "GitHub", icon: "Github", color: "text-slate-100" },
  { name: "GitLab", icon: "Gitlab", color: "text-orange-300" },
  { name: "Kafka", icon: "Workflow", color: "text-violet-300" },
  { name: "Kubernetes", icon: "Boxes", color: "text-sky-300" },
] as const;

function getIcon(name: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon | undefined>;
  return icons[name] ?? LucideIcons.Sparkles;
}

export function HomeAiTechMarquee() {
  const t = useTranslations("home.ai_technologies");
  const items = [...AI_TECHNOLOGIES, ...AI_TECHNOLOGIES];

  return (
    <section
      className="home-ai-tech-marquee overflow-hidden border-y border-slate-200/70 bg-white py-7 dark:border-slate-800 dark:bg-slate-950 md:py-9"
      aria-label={t("title")}
    >
      <div className="container-narrow px-4">
        <p className="mb-5 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 md:text-sm dark:text-slate-400">
          {t("title")}
        </p>
      </div>
      <div className="home-ai-tech-marquee-viewport">
        <div className="home-ai-tech-marquee-track">
          {items.map(({ name, icon, color }, index) => {
            const Icon = getIcon(icon);
            return (
              <span
                key={`${name}-${index}`}
                className="home-ai-tech-marquee-item"
                aria-hidden={index >= AI_TECHNOLOGIES.length}
              >
                <Icon className={`h-5 w-5 shrink-0 ${color}`} strokeWidth={1.7} aria-hidden />
                <span>{name}</span>
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
