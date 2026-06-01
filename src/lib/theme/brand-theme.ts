/** Build primary palette + apply site-wide CSS variables from admin theme settings. */

const DEFAULT_PRIMARY = "#2563eb";
const DEFAULT_RADIUS = "1rem";

const SHADE_MIX: Record<number, number> = {
  50: -0.92,
  100: -0.84,
  200: -0.72,
  300: -0.58,
  400: -0.38,
  500: -0.18,
  600: 0,
  700: 0.14,
  800: 0.28,
  900: 0.42,
  950: 0.55,
};

function normalizeHex(hex: string): string | null {
  const raw = hex.trim();
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(raw);
  if (!match) return null;
  let value = match[1].toLowerCase();
  if (value.length === 3) {
    value = value
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return `#${value}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${[clamp(r), clamp(g), clamp(b)]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")}`;
}

function mixHex(base: string, amount: number): string {
  const { r, g, b } = hexToRgb(base);
  if (amount < 0) {
    const t = -amount;
    return rgbToHex(r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t);
  }
  const t = amount;
  return rgbToHex(r * (1 - t), g * (1 - t), b * (1 - t));
}

export function generatePrimaryPalette(baseHex: string): Record<number, string> {
  const base = normalizeHex(baseHex) ?? DEFAULT_PRIMARY;
  const palette: Record<number, string> = {};
  for (const [shade, mix] of Object.entries(SHADE_MIX)) {
    const key = Number(shade);
    palette[key] = mix === 0 ? base : mixHex(base, mix);
  }
  return palette;
}

export function buildBrandThemeCss(
  primaryColor?: string,
  radius?: string
): string {
  const palette = generatePrimaryPalette(primaryColor ?? DEFAULT_PRIMARY);
  const lines = Object.entries(palette).map(
    ([shade, color]) => `  --theme-primary-${shade}: ${color};`
  );
  const r = radius?.trim() || DEFAULT_RADIUS;
  lines.push(`  --brand-radius: ${r};`);
  lines.push(`  --primary-text: ${palette[700]};`);
  return `:root {\n${lines.join("\n")}\n}`;
}

export function applyBrandThemeToDocument(primaryColor?: string, radius?: string): void {
  if (typeof document === "undefined") return;
  const palette = generatePrimaryPalette(primaryColor ?? DEFAULT_PRIMARY);
  const root = document.documentElement;
  for (const [shade, color] of Object.entries(palette)) {
    root.style.setProperty(`--theme-primary-${shade}`, color);
  }
  root.style.setProperty("--primary-text", palette[700]);
  const r = radius?.trim() || DEFAULT_RADIUS;
  root.style.setProperty("--brand-radius", r);
}
