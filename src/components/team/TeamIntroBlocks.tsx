"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const BLOCK_KEYS = ["intro_block_1", "intro_block_2", "intro_block_3"] as const;

export function TeamIntroBlocks() {
  const t = useTranslations("team");

  return (
    <section className="team-flow-section">
      <div className="container-narrow">
        <div className="flex max-w-3xl flex-col gap-3 md:gap-4">
          {BLOCK_KEYS.map((key, index) => (
            <motion.article
              key={key}
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-24px" }}
              transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-slate-200/90 bg-white px-5 py-4 text-left shadow-sm shadow-slate-900/5 ring-1 ring-slate-100/80 md:rounded-2xl md:px-6 md:py-5 dark:border-slate-700/80 dark:bg-slate-900 dark:ring-slate-800/80"
            >
              <p className="text-left text-lg font-semibold leading-relaxed text-slate-800 md:text-xl md:leading-relaxed dark:text-slate-200">
                {t(key)}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
