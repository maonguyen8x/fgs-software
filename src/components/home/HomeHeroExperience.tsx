"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { TypewriterText } from "@/components/ui/TypewriterText";
import { HeroSlideLayer } from "@/components/home/HeroSlideLayer";
import type { HeroScrollSlideItem } from "@/lib/hero-scroll-slides";
import type { HeroDisplayCopy } from "@/lib/hero-copy";
import {
  HOME_HASH_EXPLORE,
  HOME_HASH_HERO,
  scrollToHomeSection,
  setHomeHash,
} from "@/lib/home-hash";

interface HomeHeroExperienceProps {
  slides: HeroScrollSlideItem[];
  copy: HeroDisplayCopy;
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

export function HomeHeroExperience({ slides, copy }: HomeHeroExperienceProps) {
  const t = useTranslations("hero");
  const rootRef = useRef<HTMLElement>(null);
  const isHoveredRef = useRef(false);
  const activeIndexRef = useRef(0);
  const wheelLockedRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const count = Math.max(slides.length, 1);
  const showText = copy.showHeadline || copy.showSubheadline;

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

  const goToExplore = () => {
    setHomeHash(HOME_HASH_EXPLORE);
    scrollToHomeSection(HOME_HASH_EXPLORE);
  };

  return (
    <section
      id={HOME_HASH_HERO}
      ref={rootRef}
      className={`hero-scroll-root relative h-screen w-full overflow-hidden scroll-mt-0 ${isHovered ? "hero-scroll-root--hovered" : ""}`}
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

      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/15 via-transparent to-black/25" />

      <div className="relative z-10 flex h-full w-full flex-col">
        {showText && (
          <div className="container-narrow flex flex-1 flex-col justify-center px-4 pb-24 pt-16 md:pt-20">
            <div className="mx-auto max-w-3xl text-center">
              {copy.showHeadline && (
                <h1 className="page-title text-4xl font-bold tracking-tight text-white drop-shadow-md md:text-5xl lg:text-[3.25rem] lg:leading-tight">
                  {copy.typewriterEnabled && copy.typewriterTarget === "headline" ? (
                    <TypewriterText
                      text={copy.headline}
                      as="span"
                      className="text-gradient-hero min-h-[1.25em]"
                      speedMs={55}
                    />
                  ) : (
                    <span className="text-gradient-hero">{copy.headline}</span>
                  )}
                </h1>
              )}

              {copy.showSubheadline &&
                (copy.typewriterEnabled && copy.typewriterTarget === "subheadline" ? (
                  <TypewriterText
                    text={copy.subheadline}
                    as="p"
                    className="mx-auto mt-3 max-w-2xl text-base text-white/95 drop-shadow-sm md:text-lg"
                    speedMs={62}
                  />
                ) : (
                  <p className="mx-auto mt-3 max-w-2xl text-base text-white/95 drop-shadow-sm md:text-lg">
                    {copy.subheadline}
                  </p>
                ))}
            </div>
          </div>
        )}

        <div
          className={`pointer-events-auto absolute left-0 right-0 flex justify-center ${
            showText ? "bottom-10" : "bottom-12"
          }`}
        >
          <button
            type="button"
            onClick={goToExplore}
            className="group flex cursor-pointer flex-col items-center gap-1 text-white/90 transition hover:text-white"
            aria-label={t("scroll_to_explore")}
          >
            <span className="text-xs font-medium uppercase tracking-[0.2em] drop-shadow-sm">
              {t("scroll_to_explore")}
            </span>
            <ChevronDown className="h-6 w-6 animate-bounce motion-reduce:animate-none drop-shadow-sm" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}
