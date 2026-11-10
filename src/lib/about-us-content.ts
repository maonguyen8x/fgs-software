import { z } from "zod";
import type { Locale } from "@/i18n/routing";

export const ABOUT_US_CONTENT_KEY = "about_us_content_json";

const localizedSchema = z.object({
  en: z.string().max(5000).default(""),
  ja: z.string().max(5000).default(""),
  vi: z.string().max(5000).default(""),
});

export const aboutUsContentSchema = z.object({
  ceo: z
    .object({
      bubbleTitle: localizedSchema,
      message: localizedSchema,
      role: localizedSchema,
      name: z.string().max(100).default(""),
      signature: z.string().max(100).default(""),
    })
    .partial()
    .default({}),
  intro: z.array(localizedSchema).max(20).optional(),
});

export type LocalizedText = z.infer<typeof localizedSchema>;
export type AboutUsContent = z.infer<typeof aboutUsContentSchema>;

export function parseAboutUsContent(raw: string | undefined): AboutUsContent {
  if (!raw) return { ceo: {} };
  try {
    const parsed = aboutUsContentSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : { ceo: {} };
  } catch {
    return { ceo: {} };
  }
}

/** Picks the locale value, falling back to English, then to the supplied default. */
export function pickLocalized(value: LocalizedText | undefined, locale: Locale, fallback: string): string {
  if (!value) return fallback;
  return value[locale]?.trim() || value.en?.trim() || fallback;
}
