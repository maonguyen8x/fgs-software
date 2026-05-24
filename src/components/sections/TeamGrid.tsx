import Image from "next/image";
import Link from "next/link";
import { Linkedin, Github } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/i18n/routing";
import { getLocalizedField } from "@/lib/i18n-content";

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
}

export function TeamGrid({ members, locale, yearsLabel }: TeamGridProps) {
  return (
    <div className="page-grid-team">
      {members.map((member) => (
        <Card key={member.id} className="overflow-hidden">
          <div className="relative aspect-square bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-950 dark:to-slate-900">
            {member.avatar ? (
              <Image src={member.avatar} alt={member.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-4xl font-bold text-primary-300">
                {member.name.charAt(0)}
              </div>
            )}
          </div>
          <CardContent className="space-y-2">
            <h3 className="font-semibold text-heading">{member.name}</h3>
            <p className="text-sm text-primary-theme">{getLocalizedField(member, "role", locale)}</p>
            {member.experience != null && (
              <p className="text-xs text-muted-theme">
                {member.experience}+ {yearsLabel}
              </p>
            )}
            {getLocalizedField(member, "bio", locale) && (
              <p className="line-clamp-2 text-sm leading-snug text-muted-theme">
                {getLocalizedField(member, "bio", locale)}
              </p>
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
                <Link href={member.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-4 w-4 text-muted-theme hover:text-primary-600 dark:hover:text-primary-300" />
                </Link>
              )}
              {member.github && (
                <Link href={member.github} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4 text-muted-theme hover:text-primary-600 dark:hover:text-primary-300" />
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
