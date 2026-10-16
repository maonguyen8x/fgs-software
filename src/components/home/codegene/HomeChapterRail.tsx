"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  HOME_CHAPTER_COUNT,
  HOME_CHAPTER_IDS,
  chapterProgressPercent,
  type HomeChapterId,
} from "@/lib/home-chapters";
import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CHAPTER_ICONS: Record<HomeChapterId, string> = {
  "chapter-01": "Layers",
  "chapter-02": "Orbit",
  "chapter-03": "Workflow",
  "chapter-04": "ShieldCheck",
  "chapter-05": "Handshake",
};

function chapterIcon(name: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon | undefined>;
  return icons[name] ?? LucideIcons.Circle;
}

interface HomeChapterRailProps {
  activeId: HomeChapterId;
  onNavigate: (id: HomeChapterId) => void;
}

export function HomeChapterRail({ activeId, onNavigate }: HomeChapterRailProps) {
  const t = useTranslations("home.chapters");
  const activeIndex = HOME_CHAPTER_IDS.indexOf(activeId);
  const progress = chapterProgressPercent(activeIndex >= 0 ? activeIndex : 0);
  const chapterNum = String(activeIndex + 1).padStart(2, "0");

  return (
    <aside className="home-chapter-rail flex flex-col rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/90">
      <div className="mb-4 flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          {t("rail_chapter", { current: activeIndex + 1, total: HOME_CHAPTER_COUNT })}
        </p>
        <div
          className="home-chapter-progress relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-violet-600"
          style={{ ["--progress" as string]: `${progress}%` }}
          aria-label={`${progress}%`}
        >
          <span>{progress}%</span>
        </div>
      </div>

      <div className="home-chapter-display-num flex items-baseline gap-3 whitespace-nowrap font-serif text-violet-600">
        <span>{chapterNum}</span>
        <span className="home-chapter-display-total font-sans text-slate-400">
          / {HOME_CHAPTER_COUNT}
        </span>
      </div>
      <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
        {t(`${activeId}_rail_title`)}
      </h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        {t(`${activeId}_rail_subtitle`)}
      </p>

      <nav className="mt-6 flex flex-col gap-1 border-t border-slate-200/80 pt-4 dark:border-slate-700">
        {HOME_CHAPTER_IDS.map((id, index) => {
          const Icon = chapterIcon(CHAPTER_ICONS[id]);
          const active = id === activeId;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition",
                active
                  ? "bg-violet-50 font-semibold text-violet-700 dark:bg-violet-950/40 dark:text-violet-200"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/60"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold",
                  active
                    ? "border-violet-300 bg-violet-100 text-violet-700 dark:border-violet-700 dark:bg-violet-900/50"
                    : "border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-800"
                )}
              >
                {active ? <Icon className="h-4 w-4" /> : String(index + 1).padStart(2, "0")}
              </span>
              <span className="line-clamp-1">{t(`${id}_nav`)}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
