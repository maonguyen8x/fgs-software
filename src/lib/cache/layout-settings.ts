import { unstable_cache } from "next/cache";
import { getSettingsMapSafe } from "@/lib/settings-safe";

/** Cached settings for locale layout — avoids refetching full settings map on every client navigation. */
export const getCachedLayoutSettings = unstable_cache(
  async () => getSettingsMapSafe(),
  ["public-layout-settings"],
  { revalidate: 120, tags: ["site-settings"] }
);
