"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import type { Locale } from "@/i18n/routing";
import { getLocalizedField } from "@/lib/i18n-content";

interface Stat {
  id: string;
  label: string;
  labelJa?: string | null;
  labelVi?: string | null;
  value: string;
  suffix?: string | null;
}

interface StatsBarProps {
  stats: Stat[];
  locale: Locale;
}

function AnimatedNumber({ value, suffix }: { value: string; suffix?: string | null }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  const target = parseInt(value.replace(/\D/g, ""), 10) || 0;

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplay(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target]);

  return (
    <span ref={ref} className="text-4xl font-bold text-primary-600 md:text-5xl">
      {display}
      {suffix}
    </span>
  );
}

export function StatsBar({ stats, locale }: StatsBarProps) {
  return (
    <section className="border-y border-slate-200 bg-white py-12">
      <div className="container-narrow grid grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.id}
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="content-block text-center"
          >
            <AnimatedNumber value={stat.value} suffix={stat.suffix} />
            <p className="mt-2 text-sm text-slate-600">
              {getLocalizedField(stat, "label", locale)}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
