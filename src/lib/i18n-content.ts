import type { Locale } from "@/i18n/routing";

export function getLocalizedField(
  obj: object,
  field: string,
  locale: Locale
): string {
  const record = obj as Record<string, unknown>;
  if (locale === "ja") {
    const ja = record[`${field}Ja`];
    if (typeof ja === "string" && ja.length > 0) return ja;
  }
  if (locale === "vi") {
    const vi = record[`${field}Vi`];
    if (typeof vi === "string" && vi.length > 0) return vi;
  }
  const en = record[field];
  return typeof en === "string" ? en : "";
}

export function getSettingValue(
  settings: Record<string, string>,
  key: string,
  locale?: Locale
): string {
  if (locale === "ja") {
    const ja = settings[`${key}_ja`];
    if (ja) return ja;
  }
  if (locale === "vi") {
    const vi = settings[`${key}_vi`];
    if (vi) return vi;
  }
  return settings[key] ?? "";
}
