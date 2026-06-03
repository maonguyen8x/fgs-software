"use client";

import { useMounted } from "@/hooks/use-mounted";

interface ClientOnlyProps {
  children: React.ReactNode;
  /** Shown during SSR and first client paint — must match dimensions to avoid layout shift */
  fallback?: React.ReactNode;
}

/** Renders children only after mount to avoid SSR/client mismatches (motion, canvas, etc.). */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const mounted = useMounted();
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
