import { revalidateContent } from "./revalidate";
import type { CacheTag } from "./tags";
import { redisInvalidatePrefix } from "./redis-store";

export function afterAdminMutation(...tags: CacheTag[]): void {
  revalidateContent(...tags);
  void redisInvalidatePrefix("fgs:");
}
