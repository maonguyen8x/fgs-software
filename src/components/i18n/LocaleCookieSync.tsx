"use client";

import { useEffect } from "react";
import type { Locale } from "@/i18n/routing";
import { writeLocaleCookie } from "@/lib/i18n/client-locale";

export function LocaleCookieSync({ locale }: { locale: Locale }) {
  useEffect(() => {
    writeLocaleCookie(locale);
  }, [locale]);

  return null;
}
