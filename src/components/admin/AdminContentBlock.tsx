import { cn } from "@/lib/utils";

interface AdminContentBlockProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

const paddingMap = {
  sm: "p-4 md:p-5",
  md: "p-6 md:p-8",
  lg: "p-8 md:p-10",
};

/** White card block for admin main content areas. */
export function AdminContentBlock({
  children,
  className,
  padding = "md",
}: AdminContentBlockProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/90 bg-white shadow-sm",
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
