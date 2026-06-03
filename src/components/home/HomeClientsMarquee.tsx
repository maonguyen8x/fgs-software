"use client";

import Image from "next/image";
import type { Partner } from "@prisma/client";
import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";

interface HomeClientsMarqueeProps {
  partners: Partner[];
  locale: Locale;
  title: string;
  subtitle?: string;
}

function ClientBlock({ partner, locale }: { partner: Partner; locale: Locale }) {
  const name = getLocalizedField(partner, "name", locale) || partner.name;
  const isLocalLogo = partner.logoUrl?.startsWith("/") ?? false;

  const inner = (
    <article className="clients-marquee-card group mx-3 flex h-44 w-[260px] shrink-0 flex-col overflow-hidden rounded-2xl border border-theme bg-surface shadow-md transition-shadow hover:shadow-lg md:h-52 md:w-[300px]">
      <div className="relative min-h-0 flex-1 w-full bg-slate-100 dark:bg-slate-800">
        {partner.logoUrl ? (
          <Image
            src={partner.logoUrl}
            alt={name}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="300px"
            unoptimized={isLocalLogo}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary-100 to-primary-200 dark:from-primary-950 dark:to-primary-900">
            <span className="text-4xl font-bold text-primary-600/80 dark:text-primary-400">{name.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="shrink-0 border-t border-theme bg-surface px-4 py-3.5">
        <p className="line-clamp-2 text-center text-sm font-semibold leading-snug text-heading md:text-base">
          {name}
        </p>
      </div>
    </article>
  );

  if (partner.websiteUrl) {
    return (
      <a
        href={partner.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        {inner}
      </a>
    );
  }

  return <div className="shrink-0">{inner}</div>;
}

export function HomeClientsMarquee({ partners, locale, title, subtitle }: HomeClientsMarqueeProps) {
  if (partners.length === 0) return null;

  const track = [...partners, ...partners];

  return (
    <section
      className="clients-marquee-section relative w-full overflow-hidden border-y border-theme bg-surface-muted/60 py-12 md:py-14"
      aria-labelledby="home-clients-title"
    >
      <div className="container-narrow mb-8 px-4 text-center md:mb-10">
        <h2 id="home-clients-title" className="text-xl font-bold tracking-tight text-heading md:text-2xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-muted-theme md:text-base">{subtitle}</p>
        ) : null}
      </div>

      <div className="clients-marquee-viewport relative w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-[var(--background)] to-transparent md:w-24" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-[var(--background)] to-transparent md:w-24" />

        <div
          className="clients-marquee-track flex w-max items-stretch motion-reduce:animate-none"
          style={{ "--marquee-duration": `${Math.max(partners.length * 6, 24)}s` } as React.CSSProperties}
        >
          {track.map((partner, i) => (
            <ClientBlock key={`${partner.id}-${i}`} partner={partner} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
