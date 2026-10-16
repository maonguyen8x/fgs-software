"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BrainCircuit, ScanEye, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export interface ConceptProduct {
  title: string;
  description: string;
  label?: string;
}

interface ConceptProductsSectionProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  products: [ConceptProduct, ConceptProduct, ConceptProduct];
}

const PRODUCT_ICONS = [BrainCircuit, ScanEye, Sparkles] as const;

export function ConceptProductsSection({
  eyebrow,
  title,
  subtitle,
  products,
}: ConceptProductsSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion || paused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % products.length);
    }, 4_200);
    return () => window.clearInterval(timer);
  }, [paused, products.length, shouldReduceMotion]);

  return (
    <section className="concept-products-section relative overflow-hidden px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="container-narrow">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-300">{eyebrow}</p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
            {subtitle}
          </p>
        </div>

        <div
          className="concept-products-stack"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
          }}
        >
          {products.map((product, index) => {
            const Icon = PRODUCT_ICONS[index];
            const stackPosition = (index - activeIndex + products.length) % products.length;
            return (
              <motion.article
                key={product.title}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 24, rotateY: index === 0 ? 10 : index === 2 ? -10 : 0 }}
                whileInView={{ opacity: 1 }}
                animate={
                  shouldReduceMotion
                    ? { opacity: 1, x: 0, y: 0, scale: 1, rotateY: 0, zIndex: 3 }
                    : {
                        opacity: stackPosition === 0 ? 1 : 0.74,
                        x: stackPosition === 0 ? 0 : stackPosition === 1 ? 42 : -42,
                        y: stackPosition * 18,
                        scale: 1 - stackPosition * 0.055,
                        rotateY: stackPosition === 1 ? -5 : stackPosition === 2 ? 5 : 0,
                        zIndex: products.length - stackPosition,
                      }
                }
                whileHover={shouldReduceMotion ? undefined : { y: stackPosition * 18 - 5 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ type: "spring", stiffness: 115, damping: 20, delay: shouldReduceMotion ? 0 : index * 0.06 }}
                className="concept-product-card group"
                aria-hidden={stackPosition > 0}
              >
                <div className="concept-product-visual relative mb-5 flex h-52 items-center justify-center overflow-hidden rounded-2xl border border-white/60 bg-[#080c18]">
                  <div className="concept-product-orbit concept-product-orbit--one" aria-hidden />
                  <div className="concept-product-orbit concept-product-orbit--two" aria-hidden />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,rgba(123,97,255,0.24),transparent_62%)]" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-[1.75rem] border border-violet-300/30 bg-slate-900/90 text-violet-200 shadow-[0_0_48px_rgba(139,92,246,0.28)]">
                    <Icon className="h-10 w-10" strokeWidth={1.35} aria-hidden />
                    <span className="absolute -right-2 -top-2 h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)]" />
                  </div>
                  {product.label ? (
                    <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-300 backdrop-blur">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />
                      {product.label}
                    </span>
                  ) : null}
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                  {product.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {product.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
