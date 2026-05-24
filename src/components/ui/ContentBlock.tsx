import { cn } from "@/lib/utils";

interface ContentBlockProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
}

const paddingMap = {
  sm: "p-4 md:p-5",
  md: "p-6 md:p-8",
  lg: "p-8 md:p-10",
};

export function ContentBlock({ children, className, padding = "md" }: ContentBlockProps) {
  return (
    <div
      className={cn(
        "content-block rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900",
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  );
}
