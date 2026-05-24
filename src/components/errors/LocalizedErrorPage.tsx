"use client";

import { useEffect, useState } from "react";
import { ErrorPage } from "@/components/errors/ErrorPage";
import { readLocaleFromDocumentCookie } from "@/lib/i18n/client-locale";

interface LocalizedErrorPageProps {
  showRetry?: boolean;
  onRetry?: () => void;
}

export function LocalizedErrorPage({ showRetry, onRetry }: LocalizedErrorPageProps) {
  const [labels, setLabels] = useState<{
    title: string;
    description: string;
    hint?: string;
    statusLabel: string;
    retry: string;
    back_home: string;
    homeHref: string;
  } | null>(null);

  useEffect(() => {
    const locale = readLocaleFromDocumentCookie();
    void import(`../../../messages/${locale}.json`).then((mod) => {
      const errors = mod.default.errors as Record<string, string>;
      setLabels({
        title: errors.server_title,
        description: errors.server_description,
        hint: errors.server_hint,
        statusLabel: errors.server_status_label,
        retry: errors.retry,
        back_home: errors.back_home,
        homeHref: `/${locale}`,
      });
    });
  }, []);

  if (!labels) {
    return <div className="min-h-screen bg-theme" />;
  }

  return (
    <ErrorPage
      title={labels.title}
      description={labels.description}
      hint={labels.hint}
      statusCode={500}
      statusLabel={labels.statusLabel}
      showRetry={showRetry}
      onRetry={onRetry}
      retryLabel={labels.retry}
      homeLabel={labels.back_home}
      homeHref={labels.homeHref}
      variant="server"
    />
  );
}
