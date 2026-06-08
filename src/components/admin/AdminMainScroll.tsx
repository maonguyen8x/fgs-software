"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getAdminScrollRoot } from "@/lib/admin/scroll-to-section";

/** Reset admin main panel scroll when route changes (nested scroll, not window). */
export function AdminMainScroll() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const root = getAdminScrollRoot();
    root?.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, searchParams]);

  return null;
}
