import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamSectionHeadingProps {
  icon: LucideIcon;
  title: string;
  className?: string;
}

export function TeamSectionHeading({ icon: Icon, title, className }: TeamSectionHeadingProps) {
  return (
    <h2
      className={cn(
        "mb-5 flex max-w-3xl items-center gap-2.5 text-left text-2xl font-bold text-primary-600 md:text-3xl dark:text-primary-400",
        className
      )}
    >
      <Icon className="h-7 w-7 shrink-0 md:h-8 md:w-8" strokeWidth={2.25} aria-hidden />
      <span>{title}</span>
    </h2>
  );
}
