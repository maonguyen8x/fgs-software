import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import { createElement } from "react";

const TOAST_POSITION = "top-right" as const;
const TOAST_DURATION_MS = 4500;

export function showAdminSuccessToast(title: string, subtitle?: string): void {
  toast.custom(
    () =>
      createElement(
        "div",
        {
          className:
            "flex min-w-[280px] max-w-sm items-center gap-3 rounded-xl bg-emerald-600 px-5 py-4 text-white shadow-lg shadow-emerald-900/30 ring-1 ring-emerald-500/50",
          role: "status",
        },
        createElement(CheckCircle2, { className: "h-5 w-5 shrink-0", "aria-hidden": true }),
        createElement(
          "div",
          null,
          createElement("p", { className: "font-semibold" }, title),
          subtitle
            ? createElement("p", { className: "text-sm text-emerald-50/95" }, subtitle)
            : null
        )
      ),
    { duration: TOAST_DURATION_MS, position: TOAST_POSITION }
  );
}

export function showAdminErrorToast(message: string): void {
  toast.custom(
    () =>
      createElement(
        "div",
        {
          className:
            "flex min-w-[280px] max-w-sm items-center gap-3 rounded-xl bg-red-600 px-5 py-4 text-white shadow-lg shadow-red-900/30 ring-1 ring-red-500/50",
          role: "alert",
        },
        createElement(XCircle, { className: "h-5 w-5 shrink-0", "aria-hidden": true }),
        createElement("p", { className: "font-medium leading-snug" }, message)
      ),
    { duration: TOAST_DURATION_MS, position: TOAST_POSITION }
  );
}
