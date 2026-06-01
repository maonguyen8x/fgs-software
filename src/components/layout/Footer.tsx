"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Linkedin, Github, Facebook, Mail, Phone, MapPin } from "lucide-react";

interface FooterProps {
  companyName: string;
  settings: {
    linkedin_url?: string;
    github_url?: string;
    facebook_url?: string;
    address?: string;
    phone?: string;
    admin_email?: string;
  };
}

export function Footer({ companyName, settings }: FooterProps) {
  const t = useTranslations("nav");
  const tf = useTranslations("footer");
  const year = new Date().getFullYear();
  const links = [
    { href: "/about", label: t("about") },
    { href: "/services", label: t("services") },
    { href: "/team", label: t("team") },
    { href: "/works", label: t("works") },
    { href: "/contact", label: t("contact") },
  ] as const;

  return (
    <footer className="mt-auto border-t border-theme bg-surface-muted">
      <div className="container-narrow px-4 py-8 md:px-8">
        <nav
          aria-label={tf("nav_label")}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-muted-theme transition-colors hover:text-primary-600 dark:hover:text-primary-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-theme">
          {settings.admin_email && (
            <a
              href={`mailto:${settings.admin_email}`}
              className="inline-flex items-center gap-1.5 hover:text-primary-600"
            >
              <Mail className="h-4 w-4 text-primary-500" />
              {settings.admin_email}
            </a>
          )}
          {settings.phone && (
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-primary-500" />
              {settings.phone}
            </span>
          )}
          {settings.address && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary-500" />
              {settings.address}
            </span>
          )}
        </div>

        <div className="mt-5 flex justify-center gap-2">
          {settings.linkedin_url && (
            <a
              href={settings.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-surface text-muted-theme shadow-sm ring-1 ring-[var(--border)] transition-colors hover:text-primary-600"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
            </a>
          )}
          {settings.github_url && (
            <a
              href={settings.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-surface text-muted-theme shadow-sm ring-1 ring-[var(--border)] transition-colors hover:text-primary-600"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          )}
          {settings.facebook_url && (
            <a
              href={settings.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-surface text-muted-theme shadow-sm ring-1 ring-[var(--border)] transition-colors hover:text-primary-600"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>

      <div className="border-t border-theme bg-surface-muted py-4">
        <p className="text-center text-xs text-muted-theme" suppressHydrationWarning>
          © {year} {companyName}. {tf("rights")}
        </p>
      </div>
    </footer>
  );
}
