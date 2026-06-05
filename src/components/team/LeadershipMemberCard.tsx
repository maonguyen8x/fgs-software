"use client";

import { UploadImage } from "@/components/ui/UploadImage";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import type { Founder } from "@prisma/client";
import { User } from "lucide-react";

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
      <div className="relative aspect-[5/6] max-h-[235px] w-full shrink-0 overflow-hidden bg-slate-100 sm:max-h-[245px]">
        {avatarSrc ? (
          <UploadImage
            src={avatarSrc}
            alt={member.name}
            fill
            className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            sizes="280px"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-primary-300">
            <User className="h-16 w-16" />
          </span>
        )}
      </div>

      <div className="flex flex-col items-center px-4 py-4">
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
