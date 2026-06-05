"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

/** Warm route payloads for header targets so navigation feels immediate. */
export function HeaderNavPrefetch({ hrefs }: { hrefs: string[] }) {
  const router = useRouter();

  useEffect(() => {
    const unique = [...new Set(hrefs.filter(Boolean))];
    unique.forEach((href) => {
      try {
        router.prefetch(href);
      } catch {
        /* ignore */
      }
    });
  }, [hrefs, router]);

  return null;
}
