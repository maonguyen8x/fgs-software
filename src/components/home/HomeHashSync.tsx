"use client";

import { useEffect } from "react";
import {
  HOME_HASH_EXPLORE,
  HOME_HASH_HERO,
  scrollToHomeSection,
  setHomeHash,
} from "@/lib/home-hash";

const OBSERVED = [HOME_HASH_HERO, HOME_HASH_EXPLORE] as const;

export function HomeHashSync() {
  useEffect(() => {
    const elements = OBSERVED.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    let raf = 0;

    const pickActiveHash = () => {
      const viewportMid = window.innerHeight * 0.35;
      let best: { id: string; score: number } | null = null;

      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        const visibleTop = Math.max(rect.top, 0);
        const visibleBottom = Math.min(rect.bottom, window.innerHeight);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        if (visibleHeight < window.innerHeight * 0.12) continue;

        const center = rect.top + rect.height / 2;
        const score = visibleHeight - Math.abs(center - viewportMid) * 0.35;
        if (!best || score > best.score) {
          best = { id: el.id, score };
        }
      }

      if (!best) return;
      const current = window.location.hash.replace(/^#/, "");
      if (current !== best.id) {
        setHomeHash(best.id, { replace: true });
      }
    };

    const observer = new IntersectionObserver(
      () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(pickActiveHash);
      },
      { threshold: [0, 0.15, 0.35, 0.55, 0.75], rootMargin: "-8% 0px -8% 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    window.addEventListener("scroll", pickActiveHash, { passive: true });
    pickActiveHash();

    const scrollToHash = (hash: string) => {
      if (hash === HOME_HASH_EXPLORE || hash === HOME_HASH_HERO) {
        scrollToHomeSection(hash);
      }
    };

    const initial = window.location.hash.replace(/^#/, "");
    if (initial) {
      requestAnimationFrame(() => scrollToHash(initial));
    }

    const onHashChange = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (hash) scrollToHash(hash);
    };
    window.addEventListener("hashchange", onHashChange);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("scroll", pickActiveHash);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  return null;
}
