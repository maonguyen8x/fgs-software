"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/routing";
import type { SiteNoticeState } from "@/lib/site-notice-state";
import { parseSiteNoticeState } from "@/lib/site-notice-state";
import { SITE_SETTINGS_STORAGE_KEY } from "@/lib/site-settings-sync";
import { syncSiteDefaultLocaleCookieFromServer } from "@/lib/client-site-default-locale";
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
  const router = useRouter();
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

  const applyLiveUpdate = useCallback(() => {
    void refreshFromApi();
    void syncSiteDefaultLocaleCookieFromServer();
    router.refresh();
  }, [refreshFromApi, router]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === SITE_SETTINGS_STORAGE_KEY) applyLiveUpdate();
    };

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("fgs-site");
      channel.onmessage = (event: MessageEvent<{ type?: string }>) => {
        if (event.data?.type === "site-settings") applyLiveUpdate();
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
