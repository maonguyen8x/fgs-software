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

/** Products and services share one page (internal route /services). */
const PRODUCTS_SERVICES_LABELS = {
  labelEn: "Products & Services",
  labelVi: "Sản phẩm & Dịch vụ",
  labelJa: "製品・サービス",
} as const;

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
      id: "home",
      href: "/",
      labelEn: "Home",
      labelVi: "Trang chủ",
      labelJa: "ホーム",
      enabled: true,
      exact: true,
    },
    {
      id: "about",
      href: "/about",
      labelEn: "About",
      labelVi: "Giới thiệu",
      labelJa: "会社概要",
      enabled: true,
    },
    {
      id: "services",
      href: "/services",
      ...PRODUCTS_SERVICES_LABELS,
      enabled: true,
    },
    {
      id: "team",
      href: "/team",
      labelEn: "About Us",
      labelVi: "Về chúng tôi",
      labelJa: "メンバー紹介",
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

/** Old "Services" labels, replaced by the merged "Products & Services" item. */
const LEGACY_SERVICES_LABELS = {
  labelEn: ["Services"],
  labelVi: ["Dịch vụ"],
  labelJa: ["サービス"],
} as const;

/**
 * Products (works) and Services used to be two menu items; they are now one page.
 * Drops the stored "works" item and renames "services" while it still has the old default labels.
 */
function mergeProductsIntoServices(items: HeaderNavItem[]): HeaderNavItem[] {
  return items
    .filter((item) => item.id !== "works")
    .map((item) => {
      if (item.id !== "services") return item;
      const next = { ...item };
      for (const key of ["labelEn", "labelVi", "labelJa"] as const) {
        const current = item[key]?.trim();
        if (!current || (LEGACY_SERVICES_LABELS[key] as readonly string[]).includes(current)) {
          next[key] = PRODUCTS_SERVICES_LABELS[key];
        }
      }
      return next;
    });
}

export function parseHeaderNavConfig(raw: string | undefined): HeaderNavConfig {
  if (!raw?.trim()) return DEFAULT_HEADER_NAV;
  try {
    const parsed = JSON.parse(raw) as HeaderNavConfig;
    if (!parsed?.items || !Array.isArray(parsed.items)) return DEFAULT_HEADER_NAV;
    const items = (parsed.items.length > 0 ? parsed.items : DEFAULT_HEADER_NAV.items).map(
      (item) => {
        if (item.id !== "team") return item;
        const ja = item.labelJa?.trim();
        if (ja === "チーム" || ja === "私たちについて") {
          return { ...item, labelJa: "メンバー紹介" };
        }
        return item;
      }
    );
    return {
      global: { ...DEFAULT_HEADER_NAV.global, ...parsed.global },
      items: mergeProductsIntoServices(items),
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
