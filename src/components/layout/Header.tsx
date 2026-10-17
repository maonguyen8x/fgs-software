"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FgsLogo } from "@/components/brand/FgsLogo";
import { HeaderToolbar } from "./HeaderToolbar";
import {
  type HeaderNavConfig,
  type HeaderNavItem,
  isNavHrefActive,
  labelForNavItem,
  navItemStyle,
} from "@/lib/header-nav";
import type { Locale } from "@/i18n/routing";
import type { LogoDisplayMode } from "@/lib/brand-logo";

interface HeaderProps {
  companyName: string;
  logoUrl?: string | null;
  logoMode?: LogoDisplayMode;
  navConfig: HeaderNavConfig;
}

const ACTIVE_LINK_CLASS =
  "text-primary-600 dark:text-primary-400 after:absolute after:bottom-[-6px] after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-primary-600 after:content-[''] dark:after:bg-primary-400";

export function Header({
  companyName,
  logoUrl,
  logoMode = "text",
  navConfig,
}: HeaderProps) {
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [headerScrolled, setHeaderScrolled] = useState(false);

  const isHome = pathname === "/";
  const transparentHeaderPage = isHome || pathname === "/contact";
  const transparentHeader = transparentHeaderPage && !headerScrolled;

  useEffect(() => {
    if (!transparentHeaderPage) {
      setHeaderScrolled(false);
      return;
    }
    const onScroll = () => setHeaderScrolled(window.scrollY > 72);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname, transparentHeaderPage]);

  const items = navConfig.items.filter((item) => item.enabled);

  const baseLinkClass =
    "relative inline-block font-semibold tracking-wide transition-colors duration-150";

  const renderNavLink = (item: HeaderNavItem, mobile?: boolean) => {
    const active = isNavHrefActive(pathname, item.href, item.exact);
    const configuredStyle = navItemStyle(item, navConfig.global, active);
    const style = transparentHeaderPage
      ? { ...configuredStyle, color: transparentHeader ? "#fff" : "#111827" }
      : configuredStyle;
    const label = labelForNavItem(item, locale);
    const hasChildren = (item.children ?? []).filter((c) => c.enabled).length > 0;

    if (hasChildren && !mobile) {
      return (
        <div
          key={item.id}
          className="relative"
          onMouseEnter={() => setOpenSub(item.id)}
          onMouseLeave={() => setOpenSub(null)}
        >
          <button
            type="button"
            className={cn(
              baseLinkClass,
              "inline-flex cursor-pointer items-center gap-1",
              active && ACTIVE_LINK_CLASS
            )}
            style={style}
            aria-current={active ? "page" : undefined}
          >
            {label}
            <ChevronDown className="h-4 w-4 opacity-70" />
          </button>
          {openSub === item.id && (
            <div
              className={cn(
                "absolute left-0 top-full z-50 min-w-[180px] rounded-lg border py-1 shadow-lg",
                transparentHeader
                  ? "border-white/10 bg-slate-950/95"
                  : transparentHeaderPage
                    ? "border-slate-200 bg-white"
                    : "border-theme bg-surface"
              )}
            >
              <Link
                href={item.href}
                prefetch
                className="block px-4 py-2 text-sm font-medium text-heading hover:bg-surface-muted"
                style={style}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
              {(item.children ?? [])
                .filter((c) => c.enabled)
                .map((child) => {
                  const childActive = isNavHrefActive(pathname, child.href);
                  return (
                    <Link
                      key={child.id}
                      href={child.href}
                      prefetch
                      className={cn(
                        "block px-4 py-2 text-sm hover:bg-surface-muted",
                        childActive
                          ? "font-semibold text-primary-600"
                          : transparentHeader
                            ? "text-slate-300"
                            : transparentHeaderPage
                              ? "text-slate-700"
                              : "text-muted-theme"
                      )}
                      aria-current={childActive ? "page" : undefined}
                      onClick={() => setOpenSub(null)}
                    >
                      {labelForNavItem(child, locale)}
                    </Link>
                  );
                })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        prefetch
        scroll
        className={cn(
          baseLinkClass,
          mobile && "block rounded-lg px-4 py-2.5",
          mobile &&
            active &&
            (transparentHeader
              ? "bg-white/10 font-semibold"
              : transparentHeaderPage
                ? "bg-violet-100 font-semibold text-slate-900"
                : "bg-primary-50 font-semibold text-primary-600 dark:bg-primary-950/50"),
          mobile &&
            !active &&
            (transparentHeader ? "hover:bg-white/10" : "hover:bg-surface-muted"),
          !mobile && active && ACTIVE_LINK_CLASS
        )}
        style={style}
        aria-current={active ? "page" : undefined}
        onClick={() => {
          if (mobile) setOpen(false);
        }}
      >
        {label}
      </Link>
    );
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,border-color,color,box-shadow] duration-300",
        transparentHeader
          ? "home-header-transparent border-transparent bg-[#030508] text-white shadow-none backdrop-blur-none"
          : transparentHeaderPage
            ? "home-header-scrolled border-slate-200 bg-[#f3f4f6]/95 text-slate-900 shadow-sm backdrop-blur-md"
            : "border-theme bg-surface text-theme shadow-sm"
      )}
    >
      <div className="container-narrow flex h-16 items-center justify-between px-4 md:px-8">
        <FgsLogo href="/" companyName={companyName} size="md" logoUrl={logoUrl} logoMode={logoMode} />

        <nav className="hidden items-center gap-8 lg:flex">
          {items.map((item) => renderNavLink(item))}
        </nav>

        <HeaderToolbar className="hidden lg:block" />

        <button
          type="button"
          className="cursor-pointer text-current lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-current/10 transition-[max-height,opacity] duration-200 lg:hidden",
          open ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="flex flex-col gap-2 bg-inherit p-4">
          {items.map((item) => renderNavLink(item, true))}
          <HeaderToolbar className="pt-2 lg:hidden" />
        </nav>
      </div>
    </header>
  );
}
