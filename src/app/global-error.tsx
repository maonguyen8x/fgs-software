"use client";

import "./globals.css";
import { LocalizedErrorPage } from "@/components/errors/LocalizedErrorPage";
import { logger } from "@/lib/logger";

export default function RootGlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  logger.error("Global error boundary", {
    message: error.message,
    digest: error.digest,
  });
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="bg-theme font-sans antialiased">
        <LocalizedErrorPage showRetry onRetry={reset} />
      </body>
    </html>
  );
}
