import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConsultationFormLink } from "@/components/services/ConsultationFormLink";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/i18n/routing";
import { getLocalizedField } from "@/lib/i18n-content";

interface Service {
  id: string;
  icon: string;
  title: string;
  titleJa?: string | null;
  titleVi?: string | null;
  description: string;
  descriptionJa?: string | null;
  descriptionVi?: string | null;
  techStack: string[];
}

interface ServicesGridProps {
  services: Service[];
  locale: Locale;
  consultationHref: string;
  learnMoreLabel: string;
  formBadgeLabel: string;
}

function getIcon(name: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon | undefined>;
  return icons[name] ?? LucideIcons.Code2;
}

export function ServicesGrid({
  services,
  locale,
  consultationHref,
  learnMoreLabel,
  formBadgeLabel,
}: ServicesGridProps) {
  return (
    <div className="page-grid">
      {services.map((service) => {
        const Icon = getIcon(service.icon);
        return (
          <Card key={service.id} className="group flex flex-col">
            <CardHeader className="space-y-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-600 transition-all duration-300 group-hover:bg-primary-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-primary-600/30 dark:bg-primary-950 dark:text-primary-300">
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle>{getLocalizedField(service, "title", locale)}</CardTitle>
              <CardDescription className="line-clamp-3">
                {getLocalizedField(service, "description", locale)}
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-auto space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {service.techStack.slice(0, 4).map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
              </div>
              <ConsultationFormLink
                href={consultationHref}
                label={learnMoreLabel}
                badgeLabel={formBadgeLabel}
                variant="inline"
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
