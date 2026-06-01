import { cn } from "@/lib/utils";
import { AdminContentBlock } from "./AdminContentBlock";

interface AdminPageShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  unboxed?: boolean;
}

/** Standard admin page layout with optional white content block. */
export function AdminPageShell({
  title,
  description,
  children,
  actions,
  className,
  unboxed = false,
}: AdminPageShellProps) {
  return (
    <div className={cn("p-6 md:p-8", className)}>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
      {unboxed ? children : <AdminContentBlock>{children}</AdminContentBlock>}
    </div>
  );
}
