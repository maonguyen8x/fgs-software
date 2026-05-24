"use client";

import "./globals.css";
import { LocalizedErrorPage } from "@/components/errors/LocalizedErrorPage";

export default function RootGlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error(error);
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="bg-theme font-sans antialiased">
        <LocalizedErrorPage showRetry onRetry={reset} />
      </body>
    </html>
  );
}
