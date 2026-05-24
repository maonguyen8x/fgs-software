"use client";

import { useEffect } from "react";
import { THEME_STORAGE_KEY } from "@/config/theme";
import { useTheme } from "./ThemeProvider";

interface ThemeShellProps {
  children: React.ReactNode;
  settings: Record<string, string>;
}

export function ThemeShell({ children, settings }: ThemeShellProps) {
  const { setTheme, mounted } = useTheme();

  useEffect(() => {
    if (!mounted) return;
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (!stored && settings.theme_default === "dark") {
      setTheme("dark");
    }
  }, [mounted, settings.theme_default, setTheme]);

  useEffect(() => {
    const color = settings.theme_primary_color;
    const radius = settings.theme_radius;
    if (color) document.documentElement.style.setProperty("--brand-primary", color);
    if (radius) document.documentElement.style.setProperty("--brand-radius", radius);
  }, [settings.theme_primary_color, settings.theme_radius]);

  return <>{children}</>;
}
