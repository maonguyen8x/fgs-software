"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import type { Founder } from "@prisma/client";
import { User, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const BIO_PREVIEW_LEN = 220;
const HOVER_DELAY_MS = 280;

interface LeadershipMemberCardProps {
  member: Founder;
}

export function LeadershipMemberCard({ member }: LeadershipMemberCardProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("team.leadership");
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const role = getLocalizedField(member, "role", locale);
  const slogan = getLocalizedField(member, "slogan", locale);
  const bio = getLocalizedField(member, "bio", locale);
  const bioPreview =
    bio && bio.length > BIO_PREVIEW_LEN ? `${bio.slice(0, BIO_PREVIEW_LEN).trim()}…` : bio;
  const avatarSrc = member.avatar?.split("?")[0];
  const detailHref = `/team/leader/${member.id}`;

  const showPopup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(true), HOVER_DELAY_MS);
  }, []);

  const hidePopup = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(false);
  }, []);

  return (
    <article
      className="group relative"
      onMouseEnter={showPopup}
      onMouseLeave={hidePopup}
      onFocus={showPopup}
      onBlur={hidePopup}
    >
      <div className="flex flex-col items-start rounded-2xl border border-slate-200/90 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:border-primary-200/80 hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
        <button
          type="button"
          className="relative mb-4 h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-full ring-2 ring-primary-100 transition-all group-hover:ring-primary-400 dark:ring-primary-900"
          aria-label={t("view_profile", { name: member.name })}
        >
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={member.name}
              fill
              className="object-cover"
              sizes="96px"
              unoptimized={avatarSrc.startsWith("/uploads/")}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-primary-50 text-primary-400">
              <User className="h-10 w-10" />
            </span>
          )}
        </button>
        <Link
          href={detailHref}
          className="cursor-pointer text-left text-lg font-bold text-slate-900 transition-colors hover:text-primary-700 dark:text-white dark:hover:text-primary-300"
          onMouseEnter={showPopup}
        >
          {member.name}
        </Link>
        <p className="mt-1 text-left text-sm font-medium text-primary-600 dark:text-primary-400">{role}</p>
        {slogan && (
          <p className="mt-2 line-clamp-2 text-left text-sm italic text-slate-500 dark:text-slate-400">
            &ldquo;{slogan}&rdquo;
          </p>
        )}
      </div>

      {open && (
        <div
          className={cn(
            "absolute left-0 top-full z-50 mt-2 w-[min(calc(100vw-2rem),32rem)]",
            "rounded-2xl border border-slate-200/90 bg-white p-5 text-left shadow-xl shadow-slate-900/10",
            "ring-1 ring-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:ring-slate-700",
            "transition-opacity duration-200"
          )}
          role="tooltip"
          onMouseEnter={showPopup}
          onMouseLeave={hidePopup}
        >
          <div className="flex gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
              {avatarSrc ? (
                <Image src={avatarSrc} alt="" fill className="object-cover" sizes="64px" unoptimized={avatarSrc.startsWith("/uploads/")} />
              ) : (
                <span className="flex h-full items-center justify-center text-primary-300">
                  <User className="h-8 w-8" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">{member.name}</h4>
              <p className="text-sm font-medium text-primary-600">{role}</p>
            </div>
          </div>
          {slogan && <p className="mt-3 text-sm italic text-slate-500">&ldquo;{slogan}&rdquo;</p>}
          {bioPreview && (
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{bioPreview}</p>
          )}
          {member.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {member.skills.slice(0, 8).map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-950 dark:text-primary-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
          <Link
            href={detailHref}
            className="mt-4 inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-800"
          >
            {t("read_more")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </article>
  );
}
