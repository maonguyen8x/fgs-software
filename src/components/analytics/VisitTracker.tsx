"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/access")) return;

    const key = "fgs-visit-session";
    let sessionKey = sessionStorage.getItem(key);
    if (!sessionKey) {
      sessionKey =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(key, sessionKey);
    }

    const sentKey = `fgs-visit-sent:${pathname}`;
    if (sessionStorage.getItem(sentKey)) return;

    fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, sessionKey }),
      keepalive: true,
    })
      .then(() => sessionStorage.setItem(sentKey, "1"))
      .catch(() => undefined);
  }, [pathname]);

  return null;
}
