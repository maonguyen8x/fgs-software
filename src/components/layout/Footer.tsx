"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Facebook, Github, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import type { HeaderNavConfig } from "@/lib/header-nav";
import { NAV_ID_INTERNAL_ROUTES } from "@/lib/public-paths";
import { FgsLogo } from "@/components/brand/FgsLogo";
import type { LogoDisplayMode } from "@/lib/brand-logo";

interface FooterProps {
  companyName: string;
  logoUrl?: string | null;
  logoMode?: LogoDisplayMode;
  logoSize?: number;
  navConfig: HeaderNavConfig;
  settings: {
    linkedin_url?: string;
    github_url?: string;
    facebook_url?: string;
    address?: string;
    phone?: string;
  };
}

function hrefForNavId(navConfig: HeaderNavConfig, id: string): string {
  const item = navConfig.items.find((entry) => entry.id === id && entry.enabled);
  return item?.href ?? NAV_ID_INTERNAL_ROUTES[id] ?? `/${id}`;
}

export function Footer({
  companyName,
  logoUrl,
  logoMode = "text",
  logoSize,
  navConfig,
  settings,
}: FooterProps) {
  const t = useTranslations("nav");
  const ta = useTranslations("about");
  const ts = useTranslations("services");
  const tf = useTranslations("footer");
  const year = new Date().getFullYear();
  const companyLinks = [
    { id: "about", label: t("about") },
    { id: "team", label: t("team") },
    { id: "contact", label: t("contact") },
  ];
  const serviceLinks = [
    { id: "services", label: t("services") },
    { id: "works", label: t("works") },
    { id: "blog", label: t("blog") },
  ];
  const capabilityLinks = [
    { label: ts("tech_title"), href: hrefForNavId(navConfig, "services") },
    { label: ta("tech_stack.title"), href: hrefForNavId(navConfig, "about") },
  ];
  const linkClass =
    "text-sm text-slate-600 transition-colors hover:text-violet-700 focus-visible:text-violet-700";
  const iconBtnClass =
    "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:border-violet-300 hover:text-violet-700";

  return (
    <footer className="site-footer mt-auto border-t border-slate-200 bg-[#f8f9fc] text-slate-900">
      <div className="container-narrow px-4 py-12 md:px-8 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.45fr_0.8fr_0.9fr_1fr] lg:gap-12">
          <div>
            <Link href="/" aria-label={companyName} className="inline-flex">
              <FgsLogo
                companyName={companyName}
                size="lg"
                logoUrl={logoUrl}
                logoMode={logoMode}
                logoHeight={logoSize}
              />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-600">
              {tf("tagline")}
            </p>
            <a
              href="mailto:contact@fgs-software.com"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-violet-700"
            >
              <Mail className="h-4 w-4" aria-hidden />
              contact@fgs-software.com
            </a>
          </div>

          <FooterLinkColumn
            title={tf("company")}
            links={companyLinks.map((link) => ({
              ...link,
              href: hrefForNavId(navConfig, link.id),
            }))}
            linkClass={linkClass}
          />
          <FooterLinkColumn
            title={tf("services")}
            links={serviceLinks.map((link) => ({
              ...link,
              href: hrefForNavId(navConfig, link.id),
            }))}
            linkClass={linkClass}
          />
          <FooterLinkColumn
            title={tf("capabilities")}
            links={capabilityLinks}
            linkClass={linkClass}
          />
        </div>

        <div className="mt-12 flex flex-col gap-5 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500" suppressHydrationWarning>
            © {year} {companyName}. {tf("rights")}
          </p>
          <div className="flex items-center gap-2">
            {settings.linkedin_url && (
              <a href={settings.linkedin_url} target="_blank" rel="noopener noreferrer" className={iconBtnClass} aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
            )}
            {settings.github_url && (
              <a href={settings.github_url} target="_blank" rel="noopener noreferrer" className={iconBtnClass} aria-label="GitHub">
                <Github className="h-4 w-4" />
              </a>
            )}
            {settings.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className={iconBtnClass} aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
            )}
          </div>
          {(settings.phone || settings.address) && (
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              {settings.phone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" aria-hidden />
                  {settings.phone}
                </span>
              )}
              {settings.address && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {settings.address}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

function FooterLinkColumn({
  title,
  links,
  linkClass,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
  linkClass: string;
}) {
  return (
    <div>
      <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-900">
        {title}
      </h2>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={`${link.label}-${link.href}`}>
            <Link href={link.href} className={linkClass}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
