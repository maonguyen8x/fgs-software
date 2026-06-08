"use client";

import { useCallback, useEffect, useState } from "react";
import type { Locale } from "@/i18n/routing";
import type { SiteNoticeState } from "@/lib/site-notice-state";
import { parseSiteNoticeState } from "@/lib/site-notice-state";
import { SITE_SETTINGS_STORAGE_KEY } from "@/lib/site-settings-sync";
import { syncSiteDefaultLocaleCookieFromServer } from "@/lib/client-site-default-locale";
import { redirectPublicSiteToLocale } from "@/lib/client-default-locale-redirect";
import type { SiteSettingsSyncPayload } from "@/lib/site-settings-sync";
import { isValidLocale } from "@/config/locale";
import { SiteNoticeBanner } from "@/components/layout/SiteNoticeBanner";
import { MaintenancePage } from "@/components/layout/MaintenancePage";

interface SiteExperienceShellProps {
  locale: Locale;
  initialSettings: Record<string, string>;
  children: React.ReactNode;
}

export function SiteExperienceShell({
  locale,
  initialSettings,
  children,
}: SiteExperienceShellProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [notice, setNotice] = useState<SiteNoticeState>(() =>
    parseSiteNoticeState(initialSettings, locale)
  );

  const applySettings = useCallback(
    (patch: Record<string, string>) => {
      setSettings((prev) => {
        const merged = { ...prev, ...patch };
        setNotice(parseSiteNoticeState(merged, locale));
        return merged;
      });
    },
    [locale]
  );

  const refreshFromApi = useCallback(async () => {
    try {
      const res = await fetch(`/api/public/site-notice?locale=${locale}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as SiteNoticeState & {
        settings?: Record<string, string>;
      };
      setNotice(data);
      if (data.settings) applySettings(data.settings);
    } catch {
      /* ignore */
    }
  }, [locale, applySettings]);

  const applyLiveUpdate = useCallback(
    async (payload?: SiteSettingsSyncPayload) => {
      const broadcastLocale =
        payload?.defaultLocale && isValidLocale(payload.defaultLocale)
          ? payload.defaultLocale
          : null;

      if (broadcastLocale) {
        redirectPublicSiteToLocale(broadcastLocale, locale);
        return;
      }

      await refreshFromApi();
      await syncSiteDefaultLocaleCookieFromServer();
    },
    [locale, refreshFromApi]
  );

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== SITE_SETTINGS_STORAGE_KEY || !event.newValue) return;
      try {
        const payload = JSON.parse(event.newValue) as SiteSettingsSyncPayload;
        void applyLiveUpdate(payload);
      } catch {
        void applyLiveUpdate();
      }
    };

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("fgs-site");
      channel.onmessage = (event: MessageEvent<SiteSettingsSyncPayload>) => {
        if (event.data?.type === "site-settings") void applyLiveUpdate(event.data);
      };
    } catch {
      /* unsupported */
    }

    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      channel?.close();
    };
  }, [applyLiveUpdate]);

  if (notice.maintenance) {
    return <MaintenancePage title={notice.title} message={notice.message} />;
  }

  return (
    <>
      <SiteNoticeBanner settings={settings} locale={locale} />
      {children}
    </>
  );
}
