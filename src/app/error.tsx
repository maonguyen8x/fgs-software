"use client";

import { useEffect } from "react";
import { LocalizedErrorPage } from "@/components/errors/LocalizedErrorPage";
import { logger } from "@/lib/logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Route error boundary", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return <LocalizedErrorPage showRetry onRetry={reset} />;
}
