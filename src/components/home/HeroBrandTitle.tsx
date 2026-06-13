"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ClientOnly } from "@/components/ui/ClientOnly";
import {
  HERO_BRAND_TRIGGER_BEFORE_END_SEC,
  onHeroVideoLoopReset,
  onHeroVideoNearEnd,
} from "@/lib/hero-video-events";

const BRAND = "FGS Software";
const LETTERS = BRAND.split("");
const LETTER_STAGGER_S = 0.28;
const LETTER_REVEAL_S = 0.55;
const FADE_OUT_S = 0.85;
const TOTAL_VISIBLE_MS = 6000;

interface FireworkBurst {
  id: number;
  x: number;
  y: number;
}

function buildSparks(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    angle: (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.35,
    distance: 22 + Math.random() * 36,
    hue: i % 4 === 0 ? 199 : i % 4 === 1 ? 263 : i % 4 === 2 ? 186 : 210,
    delay: Math.random() * 0.06,
    size: 2 + Math.random() * 2.5,
  }));
}

function Firework({ burst }: { burst: FireworkBurst }) {
  const sparks = useRef(buildSparks(22)).current;

  return (
    <div
      className="hero-brand-firework pointer-events-none absolute"
      style={{ left: burst.x, top: burst.y }}
      aria-hidden
    >
      <motion.span
        className="absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/60"
        initial={{ scale: 0.15, opacity: 0.95 }}
        animate={{ scale: 2.8, opacity: 0 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
      />
      {sparks.map((spark, i) => (
        <motion.span
          key={i}
          className="hero-brand-firework-spark absolute block rounded-full"
          style={{
            width: spark.size,
            height: spark.size,
            background: `hsl(${spark.hue} 96% 74%)`,
            boxShadow: `0 0 10px hsl(${spark.hue} 96% 68%), 0 0 18px hsl(${spark.hue} 90% 58%)`,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1.2 }}
          animate={{
            x: Math.cos(spark.angle) * spark.distance,
            y: Math.sin(spark.angle) * spark.distance,
            opacity: 0,
            scale: 0.1,
          }}
          transition={{
            duration: 0.75,
            ease: [0.22, 1, 0.36, 1],
            delay: spark.delay,
          }}
        />
      ))}
    </div>
  );
}

function BrandSequence({ cycle }: { cycle: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const burstId = useRef(0);
  const [showFinal, setShowFinal] = useState(false);
  const [fireworks, setFireworks] = useState<FireworkBurst[]>([]);

  const triggerFirework = useCallback((index: number) => {
    const char = LETTERS[index];
    if (char === " ") return;

    const el = letterRefs.current[index];
    const container = containerRef.current;
    if (!el || !container) return;

    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const id = ++burstId.current;

    setFireworks((prev) => [
      ...prev,
      {
        id,
        x: elRect.left - containerRect.left + elRect.width / 2,
        y: elRect.top - containerRect.top + elRect.height / 2,
      },
    ]);

    window.setTimeout(() => {
      setFireworks((prev) => prev.filter((b) => b.id !== id));
    }, 1100);
  }, []);

  const animDuration =
    (LETTERS.length - 1) * LETTER_STAGGER_S + LETTER_REVEAL_S + 0.35;

  useEffect(() => {
    const timer = window.setTimeout(() => setShowFinal(true), animDuration * 1000);
    return () => window.clearTimeout(timer);
  }, [animDuration, cycle]);

  return (
    <div ref={containerRef} className="hero-brand-wrap relative mx-auto w-full max-w-5xl px-4 text-center">
      {fireworks.map((burst) => (
        <Firework key={burst.id} burst={burst} />
      ))}

      <AnimatePresence mode="wait">
        {!showFinal ? (
          <motion.h1
            key={`intro-${cycle}`}
            className="hero-brand-title hero-brand-title--intro"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.45 }}
            aria-label={BRAND}
          >
            <span className="inline-flex flex-wrap items-baseline justify-center">
              {LETTERS.map((char, i) => {
                const isSpace = char === " ";
                return (
                  <span
                    key={`${cycle}-${i}`}
                    ref={(el) => {
                      letterRefs.current[i] = el;
                    }}
                    className={`hero-brand-letter-slot inline-block ${isSpace ? "w-[0.35em]" : ""}`}
                  >
                    {isSpace ? (
                      <span>&nbsp;</span>
                    ) : (
                      <motion.span
                        className="hero-brand-letter-reveal inline-block will-change-transform"
                        style={{ transformOrigin: "left center" }}
                        initial={{ scaleX: 0, opacity: 0.25 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{
                          duration: LETTER_REVEAL_S,
                          ease: [0.22, 1, 0.36, 1],
                          delay: i * LETTER_STAGGER_S,
                        }}
                        onAnimationComplete={() => triggerFirework(i)}
                      >
                        <motion.span
                          className="hero-brand-gradient-char hero-brand-gradient-char--animate inline-block"
                          style={{ animationDelay: `${i * LETTER_STAGGER_S}s` }}
                        >
                          {char}
                        </motion.span>
                      </motion.span>
                    )}
                  </span>
                );
              })}
            </span>
          </motion.h1>
        ) : (
          <motion.h1
            key={`final-${cycle}`}
            className="hero-brand-title hero-brand-title--complete"
            initial={{ opacity: 0, scale: 0.94, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="hero-brand-final">{BRAND}</span>
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
}

function HeroBrandTitleScene() {
  const [visible, setVisible] = useState(false);
  const [cycle, setCycle] = useState(0);
  const hideTimerRef = useRef<number | null>(null);

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const showBrand = () => {
      clearHideTimer();
      setCycle((c) => c + 1);
      setVisible(true);
      hideTimerRef.current = window.setTimeout(() => {
        setVisible(false);
        hideTimerRef.current = null;
      }, TOTAL_VISIBLE_MS);
    };

    const hideBrand = () => {
      clearHideTimer();
      setVisible(false);
    };

    if (reduced) return;

    const unsubNear = onHeroVideoNearEnd(showBrand);
    const unsubLoop = onHeroVideoLoopReset(hideBrand);

    return () => {
      unsubNear();
      unsubLoop();
      clearHideTimer();
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={cycle}
          className="hero-brand-overlay pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_OUT_S, ease: [0.22, 1, 0.36, 1] }}
        >
          <BrandSequence cycle={cycle} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function HeroBrandTitle() {
  return (
    <ClientOnly fallback={null}>
      <HeroBrandTitleScene />
    </ClientOnly>
  );
}
