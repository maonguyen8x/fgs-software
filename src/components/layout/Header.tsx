"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FgsLogo } from "@/components/brand/FgsLogo";
import { HeaderToolbar } from "./HeaderToolbar";
import {
  type HeaderNavConfig,
  type HeaderNavItem,
  labelForNavItem,
  navItemStyle,
} from "@/lib/header-nav";
import type { Locale } from "@/i18n/routing";
import type { LogoDisplayMode } from "@/lib/brand-logo";
import type { Session } from "next-auth";

interface HeaderProps {
  companyName: string;
  logoUrl?: string | null;
  logoMode?: LogoDisplayMode;
  navConfig: HeaderNavConfig;
  adminSession?: Session | null;
}

export function Header({
  companyName,
  logoUrl,
  logoMode = "text",
  navConfig,
  adminSession,
}: HeaderProps) {
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);

  const items = navConfig.items.filter((item) => item.enabled);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href || pathname === `${href}/`;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const baseLinkClass =
    "relative font-semibold tracking-wide transition-all duration-200";

  const renderNavLink = (item: HeaderNavItem, mobile?: boolean) => {
    const active = isActive(item.href, item.exact);
    const style = navItemStyle(item, navConfig.global, active);
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
            className={cn(baseLinkClass, "inline-flex cursor-pointer items-center gap-1")}
            style={style}
          >
            {label}
            <ChevronDown className="h-4 w-4 opacity-70" />
          </button>
          {openSub === item.id && (
            <div className="absolute left-0 top-full z-50 min-w-[180px] rounded-lg border border-theme bg-surface py-1 shadow-lg">
              <Link
                href={item.href}
                className="block px-4 py-2 text-sm font-medium text-heading hover:bg-surface-muted"
                style={style}
              >
                {label}
              </Link>
              {(item.children ?? [])
                .filter((c) => c.enabled)
                .map((child) => (
                  <Link
                    key={child.id}
                    href={child.href}
                    className="block px-4 py-2 text-sm text-muted-theme hover:bg-surface-muted"
                  >
                    {labelForNavItem(child, locale)}
                  </Link>
                ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        className={cn(
          baseLinkClass,
          mobile && "block rounded-lg px-4 py-2.5",
          mobile && active && "bg-primary-50 text-primary-600",
          mobile && !active && "hover:bg-surface-muted",
          !mobile && active && !item.activeColor && !navConfig.global.activeColor && "text-primary-600"
        )}
        style={style}
        onClick={() => mobile && setOpen(false)}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-theme bg-surface shadow-sm">
      <div className="container-narrow flex h-16 items-center justify-between px-4 md:px-8">
        <FgsLogo href="/" companyName={companyName} size="md" logoUrl={logoUrl} logoMode={logoMode} />

        <nav className="hidden items-center gap-8 lg:flex">
          {items.map((item) => renderNavLink(item))}
        </nav>

        <HeaderToolbar className="hidden lg:block" adminSession={adminSession} />

        <button
          type="button"
          className="cursor-pointer text-theme lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-theme transition-all duration-300 lg:hidden",
          open ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="flex flex-col gap-2 bg-surface p-4">
          {items.map((item) => renderNavLink(item, true))}
          <HeaderToolbar className="pt-2 lg:hidden" adminSession={adminSession} />
        </nav>
      </div>
    </header>
  );
}
