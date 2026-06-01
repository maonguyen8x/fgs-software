import { getSettingValue } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import { AlertTriangle, Info, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface SiteNoticeBannerProps {
  settings: Record<string, string>;
  locale: Locale;
}

export function SiteNoticeBanner({ settings, locale }: SiteNoticeBannerProps) {
  if (settings.site_notice_enabled !== "true") return null;

  const title =
    getSettingValue(settings, "site_notice_title", locale) ||
    (settings.site_maintenance_mode === "true" ? "Maintenance" : "Notice");
  const message = getSettingValue(settings, "site_notice_message", locale);
  if (!title && !message) return null;

  const variant = settings.site_notice_variant ?? "info";
  const isMaintenance = settings.site_maintenance_mode === "true" || variant === "maintenance";

  const styles = isMaintenance
    ? "border-amber-300/80 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
    : variant === "warning"
      ? "border-orange-300/80 bg-orange-50 text-orange-950 dark:border-orange-800 dark:bg-orange-950/30"
      : "border-primary-200/80 bg-primary-50 text-primary-950 dark:border-primary-800 dark:bg-primary-950/30";

  const Icon = isMaintenance ? Wrench : variant === "warning" ? AlertTriangle : Info;

  return (
    <div className={cn("border-b px-4 py-3", styles)} role="status">
      <div className="container-narrow flex gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <div>
          {title && <p className="font-semibold">{title}</p>}
          {message && <p className="mt-0.5 text-sm leading-relaxed opacity-90">{message}</p>}
        </div>
      </div>
    </div>
  );
}
