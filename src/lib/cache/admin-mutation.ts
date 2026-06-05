import { revalidatePath } from "next/cache";
import { revalidateContent } from "./revalidate";
import type { CacheTag } from "./tags";
import { CACHE_TAGS } from "./tags";
import { redisDel, redisInvalidatePrefix } from "./redis-store";
import { locales } from "@/i18n/routing";

const REDIS_PARTNERS_KEY = "fgs:partners";

/** Invalidate Next.js cache, Redis, and public home pages after admin writes. */
export async function afterAdminMutation(...tags: CacheTag[]): Promise<void> {
  revalidateContent(...tags);

  if (tags.includes(CACHE_TAGS.partners)) {
    await redisDel(REDIS_PARTNERS_KEY);
    for (const locale of locales) {
      revalidatePath(`/${locale}`);
    }
  }

  if (tags.includes(CACHE_TAGS.settings)) {
    for (const locale of locales) {
      revalidatePath(`/${locale}`, "layout");
    }
  }

  await redisInvalidatePrefix("fgs:");
}
