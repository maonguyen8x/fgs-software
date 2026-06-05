"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
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
import { HeaderNavPrefetch } from "@/components/layout/HeaderNavPrefetch";

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
  const router = useRouter();
  const locale = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const items = navConfig.items.filter((item) => item.enabled);
  const prefetchHrefs = items.flatMap((item) => [
    item.href,
    ...(item.children ?? []).filter((c) => c.enabled).map((c) => c.href),
  ]);

  const baseLinkClass =
    "relative inline-block font-semibold tracking-wide transition-colors duration-150";

  const navigate = (href: string, onDone?: () => void) => {
    setPendingHref(href);
    startTransition(() => {
      router.push(href);
      onDone?.();
    });
  };

  const renderNavLink = (item: HeaderNavItem, mobile?: boolean) => {
    const active =
      isNavHrefActive(pathname, item.href, item.exact) ||
      pendingHref === item.href ||
      (pendingHref !== null && !item.exact && pendingHref.startsWith(`${item.href}/`));
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
            <div className="absolute left-0 top-full z-50 min-w-[180px] rounded-lg border border-theme bg-surface py-1 shadow-lg">
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
                        childActive ? "font-semibold text-primary-600" : "text-muted-theme"
                      )}
                      aria-current={childActive ? "page" : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(child.href, () => setOpenSub(null));
                      }}
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
          mobile && active && "bg-primary-50 font-semibold text-primary-600 dark:bg-primary-950/50",
          mobile && !active && "hover:bg-surface-muted",
          !mobile && active && ACTIVE_LINK_CLASS
        )}
        style={style}
        aria-current={active ? "page" : undefined}
        onClick={(e) => {
          e.preventDefault();
          navigate(item.href, () => {
            if (mobile) setOpen(false);
          });
        }}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-theme bg-surface shadow-sm">
      <HeaderNavPrefetch hrefs={prefetchHrefs} />
      <div className="container-narrow flex h-16 items-center justify-between px-4 md:px-8">
        <FgsLogo href="/" companyName={companyName} size="md" logoUrl={logoUrl} logoMode={logoMode} />

        <nav className="hidden items-center gap-8 lg:flex">
          {items.map((item) => renderNavLink(item))}
        </nav>

        <HeaderToolbar className="hidden lg:block" />

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
          "overflow-hidden border-t border-theme transition-[max-height,opacity] duration-200 lg:hidden",
          open ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="flex flex-col gap-2 bg-surface p-4">
          {items.map((item) => renderNavLink(item, true))}
          <HeaderToolbar className="pt-2 lg:hidden" />
        </nav>
      </div>
    </header>
  );
}
