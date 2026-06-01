import type { PageContentBlock } from "@prisma/client";
import type { Locale } from "@/i18n/routing";
import { getLocalizedField } from "@/lib/i18n-content";

export const PUBLIC_PAGES = ["home", "about", "services", "works", "contact"] as const;
export type PublicPageId = (typeof PUBLIC_PAGES)[number];

export function isPublicPageId(value: string): value is PublicPageId {
  return (PUBLIC_PAGES as readonly string[]).includes(value);
}

export type PageBlockMap = Record<string, PageContentBlock>;

export function blocksToMap(blocks: PageContentBlock[]): PageBlockMap {
  return blocks.reduce<PageBlockMap>((acc, block) => {
    acc[block.key] = block;
    return acc;
  }, {});
}

export function getPageBlockTitle(
  blocks: PageBlockMap,
  key: string,
  locale: Locale,
  fallback: string
): string {
  const block = blocks[key];
  if (!block?.isVisible) return fallback;
  return getLocalizedField(block, "title", locale) || block.title || fallback;
}

export function getPageBlockSubtitle(
  blocks: PageBlockMap,
  key: string,
  locale: Locale,
  fallback: string
): string {
  const block = blocks[key];
  if (!block?.isVisible) return fallback;
  return getLocalizedField(block, "subtitle", locale) || block.subtitle || fallback;
}

export function getPageBlockBody(
  blocks: PageBlockMap,
  key: string,
  locale: Locale,
  fallback = ""
): string {
  const block = blocks[key];
  if (!block?.isVisible) return fallback;
  return getLocalizedField(block, "body", locale) || block.body || fallback;
}
