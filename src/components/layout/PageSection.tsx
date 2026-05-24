import { cn } from "@/lib/utils";

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
  muted?: boolean;
}

export function PageSection({ children, className, muted }: PageSectionProps) {
  return (
    <section
      className={cn(
        "page-section",
        muted && "bg-surface-muted",
        className
      )}
    >
      <div className="container-narrow">{children}</div>
    </section>
  );
}
