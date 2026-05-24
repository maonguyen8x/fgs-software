"use client";

import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ErrorPage } from "@/components/errors/ErrorPage";
import { logger } from "@/lib/logger";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations("errors");

  useEffect(() => {
    logger.error("Locale route error", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <ErrorPage
      variant="server"
      statusCode={500}
      statusLabel={t("server_status_label")}
      title={t("server_title")}
      description={t("server_description")}
      hint={error.digest ? `${t("error_ref")}: ${error.digest}` : t("server_hint")}
      showRetry
      onRetry={reset}
      retryLabel={t("retry")}
      homeLabel={t("back_home")}
      homeHref={`/${locale}`}
    />
  );
}
