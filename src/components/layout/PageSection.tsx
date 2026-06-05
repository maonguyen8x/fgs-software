import { cn } from "@/lib/utils";

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  muted?: boolean;
  /** Vertical padding 12px top/bottom for balanced section spacing */
  tight?: boolean;
}

export function PageSection({ children, className, muted, tight }: PageSectionProps) {
  return (
    <section
      className={cn(
        "page-section",
        tight && "!py-3",
        muted && "bg-surface-muted",
        className
      )}
    >
      <div className="container-narrow">{children}</div>
    </section>
  );
}
