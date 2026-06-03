"use client";

import { motion } from "framer-motion";
import { Brain, Cloud, Globe2, Network, Smartphone, Sparkles, Workflow } from "lucide-react";
import { useTranslations } from "next-intl";
import { ClientOnly } from "@/components/ui/ClientOnly";
import { NeuralNetworkBackdrop } from "@/components/home/NeuralNetworkBackdrop";

const TECH_KEYS = ["ai", "digital", "iot", "cloud", "automation", "web", "mobile"] as const;

function ExploreBackdropFallback() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-linear-to-br from-primary-50/80 via-white to-cyan-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-primary-950/40" />
  );
}

function FloatingOrb({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${className}`}
      animate={{ opacity: [0.35, 0.65, 0.35], scale: [1, 1.08, 1] }}
      transition={{ duration: 8 + delay, repeat: Infinity, ease: "easeInOut", delay }}
      aria-hidden
    />
  );
}

function AiCoreVisual() {
  return (
    <motion.div
      className="explore-ai-core relative mx-auto aspect-square w-full max-w-full"
      style={{ perspective: "1000px" }}
      initial={false}
      animate={{ rotateY: [0, 6, 0, -6, 0] }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden
    >
      <motion.div
        className="absolute inset-[12%] rounded-full border border-primary-300/40 bg-linear-to-br from-primary-400/20 via-violet-400/15 to-cyan-400/20 shadow-[0_0_60px_rgba(59,130,246,0.25)] backdrop-blur-[2px] dark:border-primary-500/30"
        style={{ transformStyle: "preserve-3d", transform: "translateZ(24px)" }}
        animate={{ scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-[28%] rounded-full border border-cyan-300/50 bg-primary-500/10 dark:border-cyan-500/40"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-linear-to-br from-primary-500 to-violet-600 text-white shadow-lg shadow-primary-500/40"
        style={{ transform: "translateZ(48px)" }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Brain className="h-8 w-8" strokeWidth={1.5} />
      </motion.div>
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <motion.span
          key={deg}
          className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
          style={{
            transform: `rotate(${deg}deg) translateY(-42%) translateZ(32px)`,
          }}
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.35, ease: "easeInOut" }}
        />
      ))}
    </motion.div>
  );
}

function ExploreScene() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <NeuralNetworkBackdrop className="opacity-90" />
      <FloatingOrb className="left-[-10%] top-[10%] h-64 w-64 bg-primary-400/25" delay={0} />
      <FloatingOrb className="right-[-8%] bottom-[15%] h-72 w-72 bg-violet-400/20" delay={2} />
      <FloatingOrb className="left-[30%] bottom-[5%] h-48 w-48 bg-cyan-400/15" delay={4} />
      <div className="absolute inset-0 bg-[linear-gradient(165deg,var(--background)_0%,transparent_42%,color-mix(in_srgb,var(--color-primary-50)_40%,transparent)_100%)] dark:bg-[linear-gradient(165deg,var(--background)_0%,transparent_50%,color-mix(in_srgb,var(--color-primary-950)_50%,transparent)_100%)]" />
    </div>
  );
}

export function ExploreFutureBackdrop() {
  return <ClientOnly fallback={<ExploreBackdropFallback />}>{<ExploreScene />}</ClientOnly>;
}

function techIcon(key: (typeof TECH_KEYS)[number]) {
  switch (key) {
    case "ai":
      return Sparkles;
    case "digital":
      return Brain;
    case "iot":
      return Network;
    case "cloud":
      return Cloud;
    case "automation":
      return Workflow;
    case "web":
      return Globe2;
    case "mobile":
      return Smartphone;
    default:
      return Sparkles;
  }
}

export function ExploreTechPills() {
  const t = useTranslations("home.explore");
  const items = TECH_KEYS.map((key) => ({
    key,
    label: t(`tech_${key}`),
    icon: techIcon(key),
  }));

  return (
    <ul className="mt-7 flex flex-wrap justify-center gap-2.5 lg:justify-start">
      {items.map(({ key, label, icon: Icon }, i) => (
        <motion.li
          key={key}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: i * 0.08, duration: 0.45 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-200/70 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm dark:border-primary-800/50 dark:bg-slate-900/60 dark:text-slate-200">
            <Icon className="h-4 w-4 text-primary-600 dark:text-primary-400" strokeWidth={1.75} />
            {label}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}

export function ExploreAiVisualColumn() {
  return (
    <ClientOnly fallback={<div className="aspect-square w-full max-w-md" />}>
      <AiCoreVisual />
    </ClientOnly>
  );
}
