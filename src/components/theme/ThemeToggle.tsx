"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, mounted, toggleTheme } = useTheme();
  const t = useTranslations("theme");
  const isDark = mounted && theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      suppressHydrationWarning
      className={cn(
        "flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-theme bg-surface text-muted-theme transition-colors",
        "hover:border-primary-300 hover:text-primary-600 dark:hover:border-primary-500 dark:hover:text-primary-300"
      )}
      aria-label={mounted ? (isDark ? t("switch_to_light") : t("switch_to_dark")) : t("switch_to_dark")}
      aria-pressed={mounted ? isDark : false}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
