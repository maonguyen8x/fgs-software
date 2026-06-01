"use client";

import { motion } from "framer-motion";
import { Brain, Cpu, Sparkles } from "lucide-react";

export function HomeHeroVisual() {
  return (
    <motion.div
      className="relative mx-auto w-full max-w-md perspective-[1200px] lg:max-w-lg"
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.15 }}
    >
      <motion.div
        className="home-hero-visual-card relative aspect-square rounded-3xl border border-white/40 bg-white/50 p-6 shadow-2xl shadow-primary-600/20 backdrop-blur-xl dark:border-slate-600/40 dark:bg-slate-900/40"
        animate={{ rotateY: [-4, 4, -4], rotateX: [3, -3, 3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-4 rounded-2xl border border-primary-200/50 bg-linear-to-br from-primary-50/80 via-white/60 to-cyan-50/70 dark:from-primary-950/40 dark:via-slate-900/50 dark:to-cyan-950/30" />

        <div className="relative flex h-full flex-col items-center justify-center gap-6">
          <motion.div
            className="flex h-24 w-24 items-center justify-center rounded-2xl bg-linear-to-br from-primary-500 to-cyan-500 text-white shadow-lg shadow-primary-500/40"
            animate={{ y: [0, -6, 0], scale: [1, 1.04, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Brain className="h-12 w-12" strokeWidth={1.25} />
          </motion.div>

          <div className="grid w-full grid-cols-3 gap-3 px-2">
            {[
              { icon: Cpu, label: "AI" },
              { icon: Sparkles, label: "Cloud" },
              { icon: Brain, label: "Data" },
            ].map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                className="flex flex-col items-center gap-1.5 rounded-xl border border-primary-100/80 bg-white/70 px-2 py-3 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800/60"
                animate={{ y: [0, i % 2 === 0 ? -4 : 4, 0] }}
                transition={{ duration: 3.5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
              >
                <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  {label}
                </span>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400">
            Intelligent software · Future-ready delivery
          </p>
        </div>

        <motion.span
          className="absolute -right-3 -top-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500 to-primary-600 text-white shadow-lg"
          animate={{ rotate: [0, 8, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="h-6 w-6" />
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
