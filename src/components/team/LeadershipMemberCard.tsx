"use client";

import { UploadImage } from "@/components/ui/UploadImage";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import type { Founder } from "@prisma/client";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TEAM_PORTRAIT_CARD_FRAME_CLASS,
  TEAM_PORTRAIT_CARD_IMAGE_CLASS,
} from "@/lib/portrait-image";

interface LeadershipMemberCardProps {
  member: Founder;
}

export function LeadershipMemberCard({ member }: LeadershipMemberCardProps) {
  const locale = useLocale() as Locale;
  const role = getLocalizedField(member, "role", locale);
  const avatarSrc = member.avatar?.split("?")[0];
  const detailHref = `/team/leader/${member.id}`;

  return (
    <Link
      href={detailHref}
      prefetch
      className="leadership-member-card group flex w-full flex-col overflow-hidden rounded-2xl bg-white text-center shadow-sm transition-shadow duration-300 hover:shadow-lg dark:bg-white"
    >
      <div className={cn(TEAM_PORTRAIT_CARD_FRAME_CLASS, "rounded-t-2xl")}>
        {avatarSrc ? (
          <UploadImage
            src={avatarSrc}
            alt={member.name}
            fill
            className={TEAM_PORTRAIT_CARD_IMAGE_CLASS}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-primary-300">
            <User className="h-16 w-16" />
          </span>
        )}
      </div>

      <div className="flex flex-col items-center px-3 py-3 sm:px-4 sm:py-3.5">
        <h3 className="text-lg font-bold leading-snug text-primary-600 transition-colors group-hover:text-primary-700 dark:text-primary-600">
          {member.name}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-snug text-slate-600 sm:text-sm">
          {role}
        </p>
      </div>
    </Link>
  );
}
