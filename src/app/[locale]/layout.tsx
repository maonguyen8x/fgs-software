import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { DEFAULT_TIME_ZONE } from "@/config/i18n";
import { notFound } from "next/navigation";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/Header";
import { parseHeaderNavConfig } from "@/lib/header-nav";
import { Footer } from "@/components/layout/Footer";
import { routing, type Locale } from "@/i18n/routing";
import { getCachedLayoutSettings } from "@/lib/cache/layout-settings";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { getSettingValue } from "@/lib/i18n-content";
import { ThemeShell } from "@/components/theme/ThemeShell";
import { BrandThemeStyle } from "@/components/theme/BrandThemeStyle";
import { LocaleCookieSync } from "@/components/i18n/LocaleCookieSync";
import { VisitTracker } from "@/components/analytics/VisitTracker";
import { SiteExperienceShell } from "@/components/layout/SiteExperienceShell";
import { HydrationNotice } from "@/components/errors/HydrationNotice";
import { resolveLogoDisplay } from "@/lib/brand-logo";
import { parseChatbotPosition } from "@/lib/chatbot-position";
import { parsePublicPathMapsFromSettings } from "@/lib/public-paths";
import { PublicPathsProvider } from "@/components/providers/PublicPathsProvider";

/** Layout shell is cached via getCachedLayoutSettings; pages control their own revalidation. */
export const revalidate = 120;

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
  const settings = await getCachedLayoutSettings();
  const companyName = settings.company_name ?? "FGS Software";
  const chatbotEnabled = (settings.chatbot_enabled ?? "true") !== "false";
  const assistantName =
    getSettingValue(settings, "chatbot_name", locale as Locale) ||
    settings.chatbot_name ||
    "Nova";
  const fontFamily = settings.font_family ?? "inter";
  const { mode: logoMode, url: logoUrl } = resolveLogoDisplay(settings);
  const fontClass =
    fontFamily === "noto" || locale === "ja"
      ? "font-[family-name:var(--font-noto-jp)]"
      : fontFamily === "system"
        ? "font-sans"
        : "";
  const navConfig = parseHeaderNavConfig(settings.header_nav_json);
  const publicPathMaps = parsePublicPathMapsFromSettings(settings);
  const contactPublicPath =
    navConfig.items.find((item) => item.id === "contact" && item.enabled)?.href ?? "/contact";

  return (
    <NextIntlClientProvider messages={messages} timeZone={DEFAULT_TIME_ZONE}>
      <HydrationNotice />
      <BrandThemeStyle settings={settings} />
      <ThemeShell settings={settings}>
        <SessionProvider>
          <NavigationProgress />
          <LocaleCookieSync locale={locale as Locale} />
          <VisitTracker />
          <div className={fontClass}>
            <SiteExperienceShell locale={locale as Locale} initialSettings={settings}>
              <PublicPathsProvider maps={publicPathMaps}>
                <Header
                  companyName={companyName}
                  logoUrl={logoUrl}
                  logoMode={logoMode}
                  navConfig={navConfig}
                />
                <main className="min-h-screen bg-theme">{children}</main>
                <Footer companyName={companyName} navConfig={navConfig} settings={{
                  linkedin_url: settings.linkedin_url,
                  github_url: settings.github_url,
                  facebook_url: settings.facebook_url,
                  address: settings.address,
                  phone: settings.phone,
                  admin_email: settings.admin_email,
                }} />
              </PublicPathsProvider>
            <Toaster position="top-right" richColors />
            <GoogleAnalytics gaId={settings.ga_id} />
          </SiteExperienceShell>
          {chatbotEnabled && (
            <ChatbotWidget
              companyName={companyName}
              assistantName={assistantName}
              contactHref={contactPublicPath}
              position={parseChatbotPosition(settings.chatbot_position)}
            />
          )}
          </div>
        </SessionProvider>
      </ThemeShell>
    </NextIntlClientProvider>
  );
}
