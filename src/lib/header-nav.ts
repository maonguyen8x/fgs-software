import type { Locale } from "@/i18n/routing";

export type HeaderTextTransform = "none" | "uppercase" | "lowercase" | "capitalize";

export interface HeaderNavSubItem {
  id: string;
  href: string;
  labelEn: string;
  labelVi: string;
  labelJa?: string;
  enabled: boolean;
}

export interface HeaderNavItem {
  id: string;
  href: string;
  labelEn: string;
  labelVi: string;
  labelJa?: string;
  enabled: boolean;
  exact?: boolean;
  fontSizePx?: number;
  fontWeight?: string;
  textTransform?: HeaderTextTransform;
  color?: string;
  activeColor?: string;
  children?: HeaderNavSubItem[];
}

export interface HeaderNavGlobalStyle {
  fontSizePx?: number;
  fontWeight?: string;
  textTransform?: HeaderTextTransform;
  color?: string;
  activeColor?: string;
  fontStyle?: "normal" | "italic";
}

export interface HeaderNavConfig {
  global: HeaderNavGlobalStyle;
  items: HeaderNavItem[];
}

export const HEADER_NAV_SETTING_KEY = "header_nav_json";

export const DEFAULT_HEADER_NAV: HeaderNavConfig = {
  global: {
    fontSizePx: 17,
    fontWeight: "600",
    textTransform: "none",
    fontStyle: "normal",
    activeColor: "#2563eb",
  },
  items: [
    {
      id: "about",
      href: "/about",
      labelEn: "Company",
      labelVi: "Giới thiệu",
      labelJa: "会社概要",
      enabled: true,
    },
    {
      id: "services",
      href: "/services",
      labelEn: "Services",
      labelVi: "Dịch vụ",
      labelJa: "サービス",
      enabled: true,
    },
    {
      id: "works",
      href: "/products",
      labelEn: "Products",
      labelVi: "Sản phẩm",
      labelJa: "製品",
      enabled: true,
    },
    {
      id: "team",
      href: "/team",
      labelEn: "About Us",
      labelVi: "Về chúng tôi",
      labelJa: "チーム紹介",
      enabled: true,
    },
    {
      id: "contact",
      href: "/contact",
      labelEn: "Contact",
      labelVi: "Liên hệ",
      labelJa: "お問い合わせ",
      enabled: true,
    },
  ],
};

function canonicalizeNavItems(items: HeaderNavItem[]): HeaderNavItem[] {
  return DEFAULT_HEADER_NAV.items.map((item) => {
    const stored = items.find((candidate) => candidate.id === item.id);
    if (!stored) return item;

    return {
      ...item,
      fontSizePx: stored.fontSizePx,
      fontWeight: stored.fontWeight,
      textTransform: stored.textTransform,
      color: stored.color,
      activeColor: stored.activeColor,
      enabled: true,
    };
  });
}

export function parseHeaderNavConfig(raw: string | undefined): HeaderNavConfig {
  if (!raw?.trim()) return DEFAULT_HEADER_NAV;
  try {
    const parsed = JSON.parse(raw) as HeaderNavConfig;
    if (!parsed?.items || !Array.isArray(parsed.items)) return DEFAULT_HEADER_NAV;
    return {
      global: { ...DEFAULT_HEADER_NAV.global, ...parsed.global },
      items: canonicalizeNavItems(parsed.items),
    };
  } catch {
    return DEFAULT_HEADER_NAV;
  }
}

export function labelForNavItem(
  item: HeaderNavItem | HeaderNavSubItem,
  locale: Locale
): string {
  if (locale === "vi") return item.labelVi || item.labelEn;
  if (locale === "ja") return ("labelJa" in item && item.labelJa) || item.labelEn;
  return item.labelEn;
}

type NavInlineStyle = {
  fontSize?: string;
  fontWeight?: string;
  textTransform?: HeaderTextTransform;
  fontStyle?: string;
  color?: string;
};

/** Match current pathname (locale-free, from next-intl) to a nav href. */
export function isNavHrefActive(
  pathname: string,
  href: string,
  exact?: boolean
): boolean {
  const current = pathname.replace(/\/$/, "") || "/";
  const target = href.replace(/\/$/, "") || "/";
  if (exact) return current === target;
  if (current === target) return true;
  return target !== "/" && current.startsWith(`${target}/`);
}

export function navItemStyle(
  item: HeaderNavItem,
  global: HeaderNavGlobalStyle,
  active: boolean
): NavInlineStyle {
  const color = active
    ? item.activeColor || global.activeColor || "#2563eb"
    : item.color || global.color;
  const size = item.fontSizePx ?? global.fontSizePx;
  return {
    fontSize: size ? `${size}px` : undefined,
    fontWeight: item.fontWeight ?? global.fontWeight,
    textTransform: item.textTransform ?? global.textTransform,
    fontStyle: global.fontStyle,
    color: color || undefined,
  };
}
