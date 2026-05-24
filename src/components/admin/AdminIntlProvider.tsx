"use client";

import { NextIntlClientProvider } from "next-intl";
import { DEFAULT_TIME_ZONE } from "@/config/i18n";
import type { Locale } from "@/i18n/routing";
import type { ReactNode } from "react";

interface AdminIntlProviderProps {
  locale: Locale;
  messages: Record<string, unknown>;
  children: ReactNode;
}

export function AdminIntlProvider({ locale, messages, children }: AdminIntlProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={DEFAULT_TIME_ZONE}>
      {children}
    </NextIntlClientProvider>
  );
}
