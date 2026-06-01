"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Linkedin, Github, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/i18n/routing";
import { getLocalizedField } from "@/lib/i18n-content";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  roleJa?: string | null;
  roleVi?: string | null;
  bio?: string | null;
  bioJa?: string | null;
  bioVi?: string | null;
  avatar?: string | null;
  experience?: number | null;
  skills: string[];
  linkedin?: string | null;
  github?: string | null;
}

interface TeamGridProps {
  members: TeamMember[];
  locale: Locale;
  yearsLabel: string;
  detailCloseLabel?: string;
}

export function TeamGrid({
  members,
  locale,
  yearsLabel,
  detailCloseLabel = "Close",
}: TeamGridProps) {
  const [selected, setSelected] = useState<TeamMember | null>(null);

  return (
    <>
      <div className="page-grid-team">
        {members.map((member) => {
          const avatarSrc = member.avatar?.split("?")[0];
          const role = getLocalizedField(member, "role", locale);
          const bio = getLocalizedField(member, "bio", locale);

          return (
            <article
              key={member.id}
              className="group overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-slate-200/60 transition-shadow hover:shadow-md dark:ring-slate-700/60"
            >
              <button
                type="button"
                className="relative block aspect-square w-full cursor-pointer overflow-hidden rounded-t-2xl bg-slate-100 dark:bg-slate-800"
                onClick={() => setSelected(member)}
                aria-label={`View ${member.name}`}
              >
                {avatarSrc ? (
                  <Image
                    src={avatarSrc}
                    alt={member.name}
                    fill
                    className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
                    unoptimized={avatarSrc.startsWith("/uploads/")}
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-5xl font-bold text-primary-300">
                    {member.name.charAt(0)}
                  </span>
                )}
              </button>
              <div className="space-y-2 p-4">
                <h3 className="font-semibold text-heading">{member.name}</h3>
                <p className="text-sm text-primary-theme">{role}</p>
                {member.experience != null && (
                  <p className="text-xs text-muted-theme">
                    {member.experience}+ {yearsLabel}
                  </p>
                )}
                {bio && (
                  <p className="line-clamp-2 text-sm leading-snug text-muted-theme">{bio}</p>
                )}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {member.skills.slice(0, 4).map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  {member.linkedin && (
                    <Link
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Linkedin className="h-4 w-4 text-muted-theme hover:text-primary-600" />
                    </Link>
                  )}
                  {member.github && (
                    <Link
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Github className="h-4 w-4 text-muted-theme hover:text-primary-600" />
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-slate-900/70 text-white"
              onClick={() => setSelected(null)}
              aria-label={detailCloseLabel}
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-slate-100 dark:bg-slate-800">
              {selected.avatar ? (
                <Image
                  src={selected.avatar.split("?")[0]}
                  alt={selected.name}
                  fill
                  className="object-cover"
                  unoptimized={selected.avatar.startsWith("/uploads/")}
                />
              ) : (
                <span className="flex h-full items-center justify-center text-6xl font-bold text-primary-300">
                  {selected.name.charAt(0)}
                </span>
              )}
            </div>

            <div className="space-y-3 p-6">
              <h2 className="text-2xl font-bold text-heading">{selected.name}</h2>
              <p className="text-primary-theme font-medium">
                {getLocalizedField(selected, "role", locale)}
              </p>
              {selected.experience != null && (
                <p className="text-sm text-muted-theme">
                  {selected.experience}+ {yearsLabel}
                </p>
              )}
              {getLocalizedField(selected, "bio", locale) && (
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-theme">
                  {getLocalizedField(selected, "bio", locale)}
                </p>
              )}
              {selected.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selected.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                {selected.linkedin && (
                  <Link
                    href={selected.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1 text-sm text-primary-600 hover:underline"
                    )}
                  >
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </Link>
                )}
                {selected.github && (
                  <Link
                    href={selected.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1 text-sm text-primary-600 hover:underline"
                    )}
                  >
                    <Github className="h-4 w-4" /> GitHub
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
