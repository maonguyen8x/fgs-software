import Image from "next/image";
import type { Partner } from "@prisma/client";
import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";

interface PartnersSectionProps {
  title: string;
  subtitle?: string;
  partners: Partner[];
  locale: Locale;
}

export function PartnersSection({ title, subtitle, partners, locale }: PartnersSectionProps) {
  if (partners.length === 0) return null;

  return (
    <section className="page-section bg-surface-muted">
      <div className="container-narrow">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-heading">{title}</h2>
          {subtitle && <p className="mt-2 text-muted-theme">{subtitle}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {partners.map((p) => {
            const label = getLocalizedField(p, "name", locale) || p.name;
            const inner = (
              <div className="content-block flex h-24 items-center justify-center p-4 transition-shadow hover:shadow-md">
                {p.logoUrl ? (
                  <Image
                    src={p.logoUrl}
                    alt={label}
                    width={120}
                    height={48}
                    className="max-h-12 w-auto object-contain"
                  />
                ) : (
                  <span className="text-center text-sm font-semibold text-slate-600">{label}</span>
                )}
              </div>
            );
            return p.websiteUrl ? (
              <a
                key={p.id}
                href={p.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {inner}
              </a>
            ) : (
              <div key={p.id}>{inner}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
