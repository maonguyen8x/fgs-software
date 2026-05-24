"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Linkedin, Github, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { FgsLogo } from "@/components/brand/FgsLogo";

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
      <div className="container-narrow px-4 py-10 md:px-8">
        <div className="grid gap-8 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-5">
            <FgsLogo companyName={companyName} size="sm" showName />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-theme">{tf("tagline")}</p>
            <div className="mt-4 flex gap-2">
              {settings.linkedin_url && (
                <a
                  href={settings.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-surface text-muted-theme shadow-sm ring-1 ring-[var(--border)] transition-colors hover:text-primary-600 dark:hover:text-primary-300"
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
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-surface text-muted-theme shadow-sm ring-1 ring-[var(--border)] transition-colors hover:text-primary-600 dark:hover:text-primary-300"
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
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-surface text-muted-theme shadow-sm ring-1 ring-[var(--border)] transition-colors hover:text-primary-600 dark:hover:text-primary-300"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-theme">Menu</h4>
            <ul className="mt-3 space-y-1.5">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-theme transition-colors hover:text-primary-600 dark:hover:text-primary-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-theme">Contact</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-theme">
              {settings.admin_email && (
                <li className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                  <a href={`mailto:${settings.admin_email}`} className="hover:text-primary-600">
                    {settings.admin_email}
                  </a>
                </li>
              )}
              {settings.phone && (
                <li className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                  <span>{settings.phone}</span>
                </li>
              )}
              {settings.address && (
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-500" />
                  <span>{settings.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-theme bg-surface-muted py-4">
        <p className="text-center text-xs text-muted-theme">
          © {year} {companyName}. {tf("rights")}
        </p>
      </div>
    </footer>
  );
}
