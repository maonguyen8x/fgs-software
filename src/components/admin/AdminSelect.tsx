import { cn } from "@/lib/utils";

export const adminSelectClassName =
  "mt-1 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors hover:border-slate-300 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200/60";

interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
}

export function AdminSelect({ className, children, ...props }: AdminSelectProps) {
  return (
    <select className={cn(adminSelectClassName, className)} {...props}>
      {children}
    </select>
  );
}
