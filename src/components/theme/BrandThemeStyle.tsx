import { buildBrandThemeCss } from "@/lib/theme/brand-theme";

interface BrandThemeStyleProps {
  settings: Record<string, string>;
}

/** Injects admin theme colors on first paint (server-rendered). */
export function BrandThemeStyle({ settings }: BrandThemeStyleProps) {
  const css = buildBrandThemeCss(settings.theme_primary_color, settings.theme_radius);
  return <style id="brand-theme-vars" dangerouslySetInnerHTML={{ __html: css }} />;
}
