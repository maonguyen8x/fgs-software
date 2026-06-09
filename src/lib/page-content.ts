import type { PageContentBlock } from "@prisma/client";
import type { Locale } from "@/i18n/routing";

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

function getPageBlockLocalizedField(
  block: PageContentBlock,
  field: "title" | "subtitle" | "body",
  locale: Locale
): string {
  const record = block as Record<string, unknown>;
  if (locale === "ja") {
    const ja = record[`${field}Ja`];
    return typeof ja === "string" && ja.trim().length > 0 ? ja : "";
  }
  if (locale === "vi") {
    const vi = record[`${field}Vi`];
    return typeof vi === "string" && vi.trim().length > 0 ? vi : "";
  }
  const en = record[field];
  return typeof en === "string" ? en : "";
}

export function getPageBlockTitle(
  blocks: PageBlockMap,
  key: string,
  locale: Locale,
  fallback: string
): string {
  const block = blocks[key];
  if (!block?.isVisible) return fallback;
  const localized = getPageBlockLocalizedField(block, "title", locale);
  if (localized) return localized;
  return locale === "en" ? block.title || fallback : fallback;
}

export function getPageBlockSubtitle(
  blocks: PageBlockMap,
  key: string,
  locale: Locale,
  fallback: string
): string {
  const block = blocks[key];
  if (!block?.isVisible) return fallback;
  const localized = getPageBlockLocalizedField(block, "subtitle", locale);
  if (localized) return localized;
  return locale === "en" ? block.subtitle || fallback : fallback;
}

export function getPageBlockBody(
  blocks: PageBlockMap,
  key: string,
  locale: Locale,
  fallback = ""
): string {
  const block = blocks[key];
  if (!block?.isVisible) return fallback;
  const localized = getPageBlockLocalizedField(block, "body", locale);
  if (localized) return localized;
  return locale === "en" ? block.body || fallback : fallback;
}
