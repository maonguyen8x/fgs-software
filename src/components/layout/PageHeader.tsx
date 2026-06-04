import { cn } from "@/lib/utils";

export type PageHeaderVariant = "about" | "services" | "team" | "works" | "contact" | "default";

const variantClass: Record<PageHeaderVariant, string> = {
  about:
    "bg-gradient-to-br from-sky-50 via-primary-50/70 to-white dark:from-primary-950/40 dark:via-slate-900 dark:to-slate-900",
  services:
    "bg-gradient-to-br from-indigo-50/90 via-primary-50/60 to-white dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900",
  team:
    "bg-gradient-to-br from-emerald-50/80 via-primary-50/50 to-white dark:from-emerald-950/25 dark:via-slate-900 dark:to-slate-900",
  works:
    "bg-gradient-to-br from-violet-50/80 via-primary-50/45 to-white dark:from-violet-950/25 dark:via-slate-900 dark:to-slate-900",
  contact:
    "bg-gradient-to-br from-amber-50/70 via-primary-50/40 to-white dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900",
  default:
    "bg-gradient-to-br from-primary-50/80 via-white to-white dark:from-primary-950/30 dark:via-slate-900 dark:to-slate-900",
};

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  variant?: PageHeaderVariant;
  promoteSubtitle?: boolean;
  backgroundColor?: string;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  variant = "default",
  promoteSubtitle = false,
  backgroundColor,
  className,
}: PageHeaderProps) {
  const mainText = (promoteSubtitle ? subtitle : title) || title || subtitle || "";
  const secondaryText = promoteSubtitle ? "" : subtitle || "";

  return (
    <section
      className={cn(
        "section-padding-compact border-b border-primary-100/60 dark:border-primary-900/40",
        backgroundColor ? "" : variantClass[variant],
        className
      )}
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      <div className="container-narrow text-center">
        <h1 className="page-title text-3xl font-bold tracking-tight md:text-4xl">{mainText}</h1>
        {secondaryText && <p className="page-subtitle mx-auto mt-3 max-w-2xl text-base md:text-lg">{secondaryText}</p>}
      </div>
    </section>
  );
}
