"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-24 right-6 z-40 flex h-11 w-11 cursor-pointer items-center justify-center",
        "rounded-full border-2 border-primary-600 bg-white text-primary-600 shadow-lg",
        "transition-all duration-300 hover:bg-primary-600 hover:text-white",
        "dark:bg-slate-900 dark:hover:bg-primary-600"
      )}
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}
