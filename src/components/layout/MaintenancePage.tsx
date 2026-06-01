import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface MaintenancePageProps {
  title: string;
  message: string;
}

export function MaintenancePage({ title, message }: MaintenancePageProps) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-theme px-4 py-16">
      <div
        className={cn(
          "w-full max-w-lg rounded-2xl border border-amber-200/90 bg-white p-8 text-center shadow-lg",
          "dark:border-amber-800/60 dark:bg-slate-900"
        )}
        role="alert"
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
          <Wrench className="h-7 w-7" aria-hidden />
        </div>
        {title ? (
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h1>
        ) : null}
        {message ? (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {message}
          </p>
        ) : null}
        {!title && !message ? (
          <p className="text-slate-600 dark:text-slate-400">Website is under maintenance.</p>
        ) : null}
      </div>
    </div>
  );
}
