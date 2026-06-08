"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { ListTree, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-mounted";
import {
  ADMIN_SETTINGS_SECTIONS,
  type AdminSettingsSectionGroup,
} from "@/config/admin-settings-sections";
import { resolveAdminScrollContainer, scrollToAdminSection } from "@/lib/admin/scroll-to-section";

const GROUP_ORDER: AdminSettingsSectionGroup[] = ["panels", "content", "form"];

export function AdminSettingsSectionNav() {
  const t = useTranslations("admin.settings.section_nav");
  const mounted = useMounted();
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const container = resolveAdminScrollContainer();
    const root = container === "window" ? null : container;
    const elements = ADMIN_SETTINGS_SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        root,
        rootMargin: "-80px 0px -50% 0px",
        threshold: [0, 0.15, 0.35, 0.6],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [mounted]);

  const jumpTo = useCallback((sectionId: string) => {
    setActiveId(sectionId);
    setOpen(false);
    window.setTimeout(() => scrollToAdminSection(sectionId), 160);
  }, []);

  if (!mounted) return null;

  const panel = (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[250] cursor-default bg-slate-900/25 backdrop-blur-[2px]"
            aria-label={t("close")}
            onClick={() => setOpen(false)}
          />

          <motion.aside
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 32 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            className="fixed right-0 top-14 z-[251] flex h-[calc(100vh-3.5rem)] w-[min(22rem,calc(100vw-1rem))] flex-col border-l border-slate-200/90 bg-white shadow-2xl"
            aria-label={t("title")}
          >
            <div className="shrink-0 border-b border-slate-100 bg-linear-to-r from-primary-50 to-white px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">{t("title")}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{t("subtitle")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="cursor-pointer rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                  aria-label={t("close")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 scrollbar-thin">
              {GROUP_ORDER.map((group) => {
                const items = ADMIN_SETTINGS_SECTIONS.filter((s) => s.group === group);
                if (items.length === 0) return null;
                return (
                  <div key={group} className="mb-4 last:mb-0">
                    <p className="sticky top-0 z-10 bg-white/95 px-2 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 backdrop-blur-sm">
                      {t(`group_${group}`)}
                    </p>
                    <ul className="space-y-1">
                      {items.map((section) => {
                        const isActive = activeId === section.id;
                        return (
                          <li key={section.id}>
                            <button
                              type="button"
                              onClick={() => jumpTo(section.id)}
                              className={cn(
                                "w-full cursor-pointer rounded-xl px-3 py-2.5 text-left text-sm leading-snug transition-all duration-200",
                                group === "form" && "pl-4",
                                isActive
                                  ? "bg-primary-600 font-medium text-white shadow-md shadow-primary-600/20"
                                  : "text-slate-700 hover:bg-primary-50 hover:text-primary-800"
                              )}
                            >
                              {t(section.labelKey)}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </nav>

            <div className="shrink-0 border-t border-slate-100 px-5 py-3 text-center text-[11px] text-slate-400">
              {t("count", { count: ADMIN_SETTINGS_SECTIONS.length })}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {createPortal(panel, document.body)}

      <div className="fixed bottom-6 right-5 z-[240] sm:bottom-8 sm:right-7">
        <motion.button
          type="button"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium shadow-lg backdrop-blur-md transition-colors",
            open
              ? "border-primary-300 bg-primary-600 text-white"
              : "border-slate-200/90 bg-white/95 text-slate-700 hover:border-primary-200 hover:text-primary-700"
          )}
          aria-expanded={open}
          aria-label={t("trigger")}
        >
          {open ? <X className="h-4 w-4" /> : <ListTree className="h-4 w-4" />}
          <span>{t("trigger")}</span>
        </motion.button>
      </div>
    </>
  );
}
