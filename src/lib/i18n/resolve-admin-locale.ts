import { cookies } from "next/headers";
import {
  ADMIN_LOCALE_COOKIE_NAME,
  adminLocaleToMessagesLocale,
  parseAdminUiLocale,
} from "@/config/admin-locale";
import { LOCALE_COOKIE_NAME, parseLocale } from "@/config/locale";
import { loadMessages } from "./resolve-locale";
import type { Locale } from "@/i18n/routing";

export async function resolveAdminLocaleFromCookies(): Promise<Locale> {
  const cookieStore = await cookies();
  const adminUi = cookieStore.get(ADMIN_LOCALE_COOKIE_NAME)?.value;
  if (adminUi) {
    return adminLocaleToMessagesLocale(parseAdminUiLocale(adminUi));
  }
  const publicLocale = parseLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
  if (publicLocale === "en" || publicLocale === "vi") return publicLocale;
  return "vi";
}

export async function loadAdminMessages(): Promise<Record<string, unknown>> {
  const locale = await resolveAdminLocaleFromCookies();
  return loadMessages(locale);
}
