import { cookies } from "next/headers";
import { LOCALE_COOKIE_NAME, parseLocale } from "@/config/locale";
import type { Locale } from "@/i18n/routing";

export async function resolveLocaleFromCookies(): Promise<Locale> {
  const cookieStore = await cookies();
  return parseLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}

export async function loadMessages(locale: Locale): Promise<Record<string, unknown>> {
  return (await import(`../../../messages/${locale}.json`)).default as Record<string, unknown>;
}
