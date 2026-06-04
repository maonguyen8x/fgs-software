"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { HOME_HASH_HERO, scrollToHomeSection, setHomeHash } from "@/lib/home-hash";

function ScrollToTopIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M12 5.5L8.5 9M12 5.5L15.5 9M12 5.5V18.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface ScrollToTopButtonProps {
  /** On homepage: scroll to hero + update hash */
  home?: boolean;
}

export function ScrollToTopButton({ home = false }: ScrollToTopButtonProps) {
  const t = useTranslations("hero");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollUp = () => {
    if (home) {
      setHomeHash(HOME_HASH_HERO, { replace: true });
      scrollToHomeSection(HOME_HASH_HERO);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label={t("scroll_to_top")}
      onClick={scrollUp}
      className={cn(
        "fixed bottom-24 right-6 z-[180] flex h-12 w-12 cursor-pointer items-center justify-center",
        "rounded-full border-2 border-primary-600/90 bg-white/95 text-primary-600 shadow-lg shadow-primary-900/15",
        "backdrop-blur-sm transition-all duration-300",
        "hover:scale-105 hover:border-primary-600 hover:bg-primary-600 hover:text-white",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500",
        "dark:border-primary-500 dark:bg-slate-900/95 dark:text-primary-300 dark:hover:bg-primary-600 dark:hover:text-white"
      )}
    >
      <ScrollToTopIcon className="h-6 w-6" />
    </button>
  );
}
