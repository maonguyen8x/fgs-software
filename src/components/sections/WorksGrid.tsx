import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/i18n/routing";
import { getLocalizedField } from "@/lib/i18n-content";

interface Work {
  id: string;
  slug: string;
  title: string;
  titleJa?: string | null;
  titleVi?: string | null;
  summary: string;
  summaryJa?: string | null;
  summaryVi?: string | null;
  thumbnail?: string | null;
  techStack: string[];
  category: string;
}

interface WorksGridProps {
  works: Work[];
  locale: Locale;
  viewLabel: string;
}

export function WorksGrid({ works, locale, viewLabel }: WorksGridProps) {
  return (
    <div className="page-grid">
      {works.map((work) => (
        <Link key={work.id} href={`/${locale}/works/${work.slug}`}>
          <Card className="h-full overflow-hidden transition-transform hover:-translate-y-0.5">
            <div className="relative aspect-video bg-gradient-to-br from-primary-100 to-slate-100 dark:from-primary-950 dark:to-slate-800">
              {work.thumbnail && (
                <Image src={work.thumbnail} alt={work.title} fill className="object-cover" />
              )}
            </div>
            <CardHeader className="space-y-2">
              <Badge className="w-fit">{work.category}</Badge>
              <CardTitle className="line-clamp-1">{getLocalizedField(work, "title", locale)}</CardTitle>
              <CardDescription className="line-clamp-2">
                {getLocalizedField(work, "summary", locale)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {work.techStack.slice(0, 4).map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
              <p className="text-sm font-medium text-primary-theme">{viewLabel} →</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
