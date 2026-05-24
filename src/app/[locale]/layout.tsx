import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { DEFAULT_TIME_ZONE } from "@/config/i18n";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { routing, type Locale } from "@/i18n/routing";
import { getSettingsMapSafe } from "@/lib/settings-safe";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { getSettingValue } from "@/lib/i18n-content";
import { ThemeShell } from "@/components/theme/ThemeShell";
import { LocaleCookieSync } from "@/components/i18n/LocaleCookieSync";

export const revalidate = 300;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const settings = await getSettingsMapSafe();
  const companyName = settings.company_name ?? "FGS Software";
  const chatbotEnabled = settings.chatbot_enabled !== "false";
  const assistantName =
    getSettingValue(settings, "chatbot_name", locale as Locale) ||
    settings.chatbot_name ||
    "Nova";
  const fontFamily = settings.font_family ?? "inter";
  const fontClass =
    fontFamily === "noto" || locale === "ja"
      ? "font-[family-name:var(--font-noto-jp)]"
      : fontFamily === "system"
        ? "font-sans"
        : "";

  return (
    <NextIntlClientProvider messages={messages} timeZone={DEFAULT_TIME_ZONE}>
      <ThemeShell settings={settings}>
        <LocaleCookieSync locale={locale as Locale} />
        <div className={fontClass}>
          <Header companyName={companyName} />
          <main className="min-h-screen bg-theme">{children}</main>
        <Footer
          companyName={companyName}
          settings={{
            linkedin_url: settings.linkedin_url,
            github_url: settings.github_url,
            facebook_url: settings.facebook_url,
            address: settings.address,
            phone: settings.phone,
            admin_email: settings.admin_email,
          }}
        />
        <Toaster position="top-right" richColors />
        <GoogleAnalytics gaId={settings.ga_id} />
        {chatbotEnabled && (
          <ChatbotWidget
            companyName={companyName}
            assistantName={assistantName}
            contactHref={`/${locale}/contact`}
          />
        )}
        </div>
      </ThemeShell>
    </NextIntlClientProvider>
  );
}
