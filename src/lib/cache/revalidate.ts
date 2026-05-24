import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "./tags";

export function revalidateAllContent(): void {
  Object.values(CACHE_TAGS).forEach((tag) => revalidateTag(tag));
}

export function revalidateContent(...tags: (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS][]): void {
  tags.forEach((tag) => revalidateTag(tag));
}
