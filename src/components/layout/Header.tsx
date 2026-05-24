"use client";

import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { cn } from "@/lib/utils";
import { FgsLogo } from "@/components/brand/FgsLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface HeaderProps {
  companyName: string;
}

export function Header({ companyName }: HeaderProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links: Array<{ href: string; label: string; exact?: boolean }> = [
    { href: "/", label: t("home"), exact: true },
    { href: "/about", label: t("about") },
    { href: "/services", label: t("services") },
    { href: "/team", label: t("team") },
    { href: "/works", label: t("works") },
    { href: "/contact", label: t("contact") },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href || pathname === `${href}/`;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const linkClass = (active: boolean) =>
    cn(
      "relative text-base font-semibold tracking-wide transition-all duration-200 md:text-[17px]",
      active
        ? "text-primary-600 dark:text-primary-300"
        : "text-muted-theme hover:text-primary-600 dark:hover:text-primary-300",
      active &&
        "after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-primary-600 dark:after:bg-primary-400"
    );

  return (
    <header className="sticky top-0 z-50 border-b border-theme bg-surface/95 backdrop-blur-md">
      <div className="container-narrow flex h-16 items-center justify-between px-4 md:px-8">
        <FgsLogo href="/" companyName={companyName} size="md" />

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={cn(linkClass(isActive(link.href, link.exact)), "cursor-pointer")}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>

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
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="flex flex-col gap-2 bg-surface p-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "cursor-pointer rounded-lg px-4 py-2.5 text-base font-semibold",
                isActive(link.href, link.exact)
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-950/60 dark:text-primary-300"
                  : "hover:bg-surface-muted"
              )}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 pt-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}
