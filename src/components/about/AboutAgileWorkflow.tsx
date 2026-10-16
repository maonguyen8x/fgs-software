"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Circle, MessageCircle, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

const LANES = ["backlog", "in_progress", "review"] as const;
const CARD_STYLES = [
  "border-violet-200 bg-violet-50 dark:border-violet-900 dark:bg-violet-950/30",
  "border-cyan-200 bg-cyan-50 dark:border-cyan-900 dark:bg-cyan-950/30",
  "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30",
  "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30",
] as const;
const CARD_COLORS = ["bg-violet-500", "bg-cyan-500", "bg-amber-500", "bg-emerald-500"] as const;

export function AboutAgileWorkflow() {
  const t = useTranslations("about.workflow");
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="overflow-hidden bg-[#090b12] px-4 py-16 text-white sm:px-6 md:py-24 lg:px-8">
      <div className="container-narrow grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-violet-300">
            {t("eyebrow")}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{t("title")}</h2>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-300 md:text-base">
            {t("description")}
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {(["listen", "sketch", "build", "ship"] as const).map((step, index) => (
              <span
                key={step}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-200"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${CARD_COLORS[index]}`} />
                {t(`steps.${step}`)}
              </span>
            ))}
          </div>
        </div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65 }}
          className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 shadow-[0_28px_90px_-42px_rgba(124,58,237,0.45)] sm:p-6"
        >
          <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-sm font-semibold text-white">{t("board_title")}</p>
              <p className="mt-1 text-xs text-slate-400">{t("board_subtitle")}</p>
            </div>
            <div className="flex -space-x-2" aria-hidden>
              {["A", "M", "K"].map((initial, index) => (
                <span
                  key={initial}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#10121b] text-[10px] font-bold text-white ${CARD_COLORS[index]}`}
                >
                  {initial}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {LANES.map((lane, laneIndex) => (
              <div key={lane} className="min-w-0 rounded-2xl bg-black/20 p-2 sm:p-3">
                <div className="mb-3 flex items-center justify-between gap-1">
                  <p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300 sm:text-xs">
                    {t(`lanes.${lane}`)}
                  </p>
                  {laneIndex === 0 ? (
                    <Plus className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
                  ) : (
                    <span className="text-[10px] text-slate-500">0{laneIndex + 1}</span>
                  )}
                </div>
                <div className="space-y-2">
                  {[0, 1].map((cardIndex) => {
                    const index = laneIndex + cardIndex;
                    const Icon = index === 3 ? Check : index === 2 ? MessageCircle : Circle;
                    return (
                      <div
                        key={`${lane}-${cardIndex}`}
                        className={`rounded-xl border p-2.5 sm:p-3 ${CARD_STYLES[index]}`}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className={`h-1.5 w-7 rounded-full ${CARD_COLORS[index]}`} />
                          <Icon className="h-3 w-3 text-slate-400" aria-hidden />
                        </div>
                        <p className="text-[10px] font-semibold leading-snug text-slate-800 dark:text-slate-100 sm:text-xs">
                          {t(`cards.${index}`)}
                        </p>
                        <div className="mt-3 flex items-center justify-between text-[9px] text-slate-500">
                          <span>{t("sprint")}</span>
                          <span className="flex -space-x-1" aria-hidden>
                            <span className="h-4 w-4 rounded-full border border-white bg-slate-400 dark:border-slate-800" />
                            <span className="h-4 w-4 rounded-full border border-white bg-violet-400 dark:border-slate-800" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
