import { UploadImage } from "@/components/ui/UploadImage";
import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import type { Founder } from "@prisma/client";
import { User } from "lucide-react";

interface FoundersGridProps {
  title: string;
  founders: Founder[];
  locale: Locale;
}

export function FoundersGrid({ title, founders, locale }: FoundersGridProps) {
  if (founders.length === 0) return null;

  return (
    <section className="section-padding bg-gradient-to-b from-primary-50/50 to-white">
      <div className="container-narrow">
        <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">{title}</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {founders.map((member) => (
            <article
              key={member.id}
              className="group flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative mb-5 h-28 w-28 overflow-hidden rounded-full ring-4 ring-primary-100 transition-all group-hover:ring-primary-300">
                {member.avatar ? (
                  <UploadImage
                    src={member.avatar}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary-50 text-primary-400">
                    <User className="h-12 w-12" />
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
              <p className="mt-1 text-sm font-medium text-primary-600">
                {getLocalizedField(member, "role", locale)}
              </p>
              {getLocalizedField(member, "slogan", locale) && (
                <p className="mt-3 text-sm italic text-slate-500">
                  &ldquo;{getLocalizedField(member, "slogan", locale)}&rdquo;
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
