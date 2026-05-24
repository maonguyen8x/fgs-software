import { THEME_STORAGE_KEY, type ThemeMode } from "@/config/theme";

export function readStoredTheme(fallback: ThemeMode = "light"): ThemeMode {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "dark" || stored === "light" ? stored : fallback;
  } catch {
    return fallback;
  }
}

export function applyThemeToDocument(theme: ThemeMode): void {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme === "dark" ? "dark" : "light";
  root.dataset.theme = theme;
}
