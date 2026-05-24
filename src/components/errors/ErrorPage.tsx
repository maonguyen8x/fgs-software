"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, Home, RefreshCw, ServerCrash, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ErrorPageProps {
  title: string;
  description: string;
  hint?: string;
  statusCode?: number;
  statusLabel?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  homeHref?: string;
  retryLabel?: string;
  homeLabel?: string;
  variant?: "server" | "network" | "generic";
}

export function ErrorPage({
  title,
  description,
  hint,
  statusCode,
  statusLabel,
  showRetry,
  onRetry,
  homeHref = "/",
  retryLabel = "Try again",
  homeLabel = "Back to home",
  variant = "generic",
}: ErrorPageProps) {
  const Icon =
    variant === "network" ? WifiOff : variant === "server" ? ServerCrash : AlertTriangle;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/60 to-primary-100/40 px-4 py-16 dark:from-slate-950 dark:via-slate-900 dark:to-primary-950/30"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary-400/25 blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-primary-600/20 blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xl"
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 22, delay: 0.08 }}
          className="overflow-hidden rounded-3xl border border-white/80 bg-white/90 shadow-2xl shadow-primary-900/15 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/90"
        >
          <motion.div
            aria-hidden
            className="h-1.5 bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% 200%" }}
          />

          <div className="px-8 py-10 text-center md:px-12 md:py-12">
            {(statusCode || statusLabel) && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200/90 bg-primary-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary-700 dark:border-primary-800 dark:bg-primary-950/70 dark:text-primary-200"
              >
                {statusCode && <span>{statusCode}</span>}
                {statusCode && statusLabel && <span className="opacity-40">|</span>}
                {statusLabel && <span>{statusLabel}</span>}
              </motion.div>
            )}

            <motion.div
              initial={{ rotate: -10, scale: 0.88 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.2 }}
              className="mx-auto mb-7 flex h-28 w-28 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-xl shadow-primary-600/35 ring-4 ring-primary-100/90 dark:ring-primary-900/60"
            >
              <Icon className="h-12 w-12" strokeWidth={1.6} />
            </motion.div>

            <h1 className="text-2xl font-bold tracking-tight text-heading md:text-3xl">{title}</h1>
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-theme md:text-lg">
              {description}
            </p>
            {hint && (
              <p className="mx-auto mt-4 max-w-md rounded-2xl border border-slate-200/80 bg-slate-50/90 px-4 py-3 text-sm leading-relaxed text-muted-theme dark:border-slate-700 dark:bg-slate-800/60">
                {hint}
              </p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-9 flex flex-wrap items-center justify-center gap-3"
            >
              {showRetry && onRetry && (
                <Button
                  type="button"
                  onClick={onRetry}
                  variant="outline"
                  size="lg"
                  className="cursor-pointer gap-2 border-primary-200 hover:border-primary-300 hover:bg-primary-50 dark:border-primary-800 dark:hover:bg-primary-950/50"
                >
                  <RefreshCw className="h-4 w-4" />
                  {retryLabel}
                </Button>
              )}
              <Button asChild size="lg" className="cursor-pointer gap-2 shadow-lg shadow-primary-600/25">
                <Link href={homeHref}>
                  <Home className="h-4 w-4" />
                  {homeLabel}
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
