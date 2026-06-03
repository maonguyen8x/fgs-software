"use client";

import { LocalizedErrorPage } from "@/components/errors/LocalizedErrorPage";

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <LocalizedErrorPage showRetry onRetry={reset} />;
}
