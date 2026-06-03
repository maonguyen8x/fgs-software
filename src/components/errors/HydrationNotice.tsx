"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, X, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function isHydrationMessage(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("hydration") ||
    m.includes("hydrated") ||
    m.includes("did not match") ||
    m.includes("server rendered html")
  );
}

export function HydrationNotice() {
  const t = useTranslations("errors");
  const [visible, setVisible] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);

  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      const msg = event.message ?? "";
      if (isHydrationMessage(msg)) {
        setDetail(msg.slice(0, 120));
        setVisible(true);
      }
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const msg = String(event.reason?.message ?? event.reason ?? "");
      if (isHydrationMessage(msg)) {
        setDetail(msg.slice(0, 120));
        setVisible(true);
      }
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="fixed bottom-24 left-4 right-4 z-[190] mx-auto max-w-lg md:left-auto md:right-28"
        >
          <div className="overflow-hidden rounded-2xl border border-amber-200/90 bg-white/95 shadow-xl shadow-amber-500/15 ring-1 ring-amber-100 backdrop-blur-md dark:border-amber-900/60 dark:bg-slate-900/95 dark:ring-amber-950">
            <div className="flex gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 to-orange-500 text-white shadow-md">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {t("hydration_title")}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {t("hydration_description")}
                </p>
                {detail && process.env.NODE_ENV === "development" && (
                  <p className="mt-2 truncate font-mono text-[10px] text-amber-800/80 dark:text-amber-200/70">
                    {detail}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-700"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    {t("hydration_refresh")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisible(false)}
                    className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {t("hydration_dismiss")}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVisible(false)}
                className="shrink-0 cursor-pointer rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                aria-label={t("hydration_dismiss")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
