import Link from "next/link";
import { ExternalLink, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONSULTATION_FORM_URL } from "@/config/consultation-form";

interface ConsultationFormLinkProps {
  label: string;
  badgeLabel: string;
  href?: string;
  variant?: "inline" | "button";
  className?: string;
}

function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

export function ConsultationFormLink({
  label,
  badgeLabel,
  href = CONSULTATION_FORM_URL,
  variant = "inline",
  className,
}: ConsultationFormLinkProps) {
  const content = (
    <>
      <FileText className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" aria-hidden />
      <span className="font-semibold">{label}</span>
      <span className="rounded-md border border-primary-200/90 bg-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary-700 shadow-sm dark:border-primary-800 dark:bg-slate-900 dark:text-primary-300">
        {badgeLabel}
      </span>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
    </>
  );

  const baseClass = cn(
    "inline-flex cursor-pointer items-center gap-2 transition-colors",
    variant === "inline" &&
      "rounded-lg border border-primary-200/80 bg-primary-50/60 px-3 py-2 text-sm text-primary-800 hover:border-primary-300 hover:bg-primary-100/80 dark:border-primary-800/60 dark:bg-primary-950/40 dark:text-primary-200 dark:hover:bg-primary-950/70",
    variant === "button" &&
      "rounded-xl border border-primary-200 bg-primary-50 px-5 py-2.5 text-base text-primary-800 shadow-sm hover:bg-primary-100 dark:border-primary-700 dark:bg-primary-950/50 dark:text-primary-100",
    className
  );

  if (isExternalHref(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClass}
        title={badgeLabel}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={baseClass}>
      {content}
    </Link>
  );
}
