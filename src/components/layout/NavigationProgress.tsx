"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "@/i18n/navigation";

/** Thin top bar while a route transition is in progress — immediate visual feedback on header clicks. */
export function NavigationProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const prevPath = useRef(pathname);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (pathname !== prevPath.current) {
      prevPath.current = pathname;
      setActive(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setActive(false), 400);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement).closest("a[href]");
      if (!anchor || anchor.getAttribute("target") === "_blank") return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        if (url.pathname + url.search === window.location.pathname + window.location.search) return;
        setActive(true);
      } catch {
        /* ignore */
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-0 z-[100] h-0.5 overflow-hidden"
      aria-hidden
    >
      <div
        className={`h-full bg-primary-600 transition-opacity duration-200 dark:bg-primary-400 ${
          active ? "opacity-100" : "opacity-0"
        }`}
        style={{
          width: active ? "100%" : "0%",
          transition: active
            ? "width 0.35s ease-out, opacity 0.15s ease"
            : "width 0.2s ease-in, opacity 0.25s ease",
        }}
      />
    </div>
  );
}
