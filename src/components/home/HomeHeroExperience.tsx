"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { HeroSlideLayer } from "@/components/home/HeroSlideLayer";
import { HeroQuantumNeuralOverlay } from "@/components/home/HeroQuantumNeuralOverlay";
import type { HeroScrollSlideItem } from "@/lib/hero-scroll-slides";
import { HOME_HASH_HERO } from "@/lib/home-hash";
import { useHeroAutoplayUnlock } from "@/lib/hero-media-autoplay";

interface HomeHeroExperienceProps {
  slides: HeroScrollSlideItem[];
}

const WHEEL_COOLDOWN_MS = 650;
const WHEEL_DELTA_THRESHOLD = 28;

/** Crossfade only — keeps video sharp (no scale/blur from 3D slide). */
function bgLayerStyle(offset: number) {
  const abs = Math.abs(offset);
  const visible = abs < 0.5;
  return {
    opacity: visible ? 1 : 0,
    zIndex: visible ? 2 : 0,
    pointerEvents: visible ? ("auto" as const) : ("none" as const),
  };
}

export function HomeHeroExperience({ slides }: HomeHeroExperienceProps) {
  const t = useTranslations("hero");
  const rootRef = useRef<HTMLElement>(null);
  const isHoveredRef = useRef(false);
  const activeIndexRef = useRef(0);
  const wheelLockedRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const count = Math.max(slides.length, 1);

  useHeroAutoplayUnlock();

  activeIndexRef.current = activeIndex;

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (!isHoveredRef.current) return;
      if (Math.abs(e.deltaY) < WHEEL_DELTA_THRESHOLD) return;

      if (wheelLockedRef.current) {
        e.preventDefault();
        return;
      }

      const current = activeIndexRef.current;
      const goingDown = e.deltaY > 0;
      const goingUp = e.deltaY < 0;

      if (goingDown && current < count - 1) {
        e.preventDefault();
        wheelLockedRef.current = true;
        window.setTimeout(() => {
          wheelLockedRef.current = false;
        }, WHEEL_COOLDOWN_MS);
        setActiveIndex(current + 1);
        return;
      }

      if (goingUp && current > 0) {
        e.preventDefault();
        wheelLockedRef.current = true;
        window.setTimeout(() => {
          wheelLockedRef.current = false;
        }, WHEEL_COOLDOWN_MS);
        setActiveIndex(current - 1);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [count]);

  return (
    <section
      id={HOME_HASH_HERO}
      ref={rootRef}
      className={`hero-scroll-root relative w-full overflow-hidden scroll-mt-0 ${isHovered ? "hero-scroll-root--hovered" : ""}`}
      aria-label={t("scroll_to_explore")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
    >
      <div className="hero-scroll-stage absolute inset-0 h-full w-full" aria-hidden>
        {slides.map((slide, i) => {
          const offset = i - activeIndex;
          const style = bgLayerStyle(offset);
          const isActive = i === activeIndex;
          return (
            <div
              key={slide.id}
              className="hero-bg-layer hero-bg-layer--fade absolute inset-0 h-full w-full"
              style={style}
            >
              <HeroSlideLayer slide={slide} isActive={isActive} offset={offset} />
            </div>
          );
        })}
      </div>

      <HeroQuantumNeuralOverlay />
    </section>
  );
}
