"use client";

import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AdminSessionGate } from "./AdminSessionGate";

/** Shared header controls (theme + language + admin menu when logged in). */
export function HeaderToolbar({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <LanguageSwitcher />
        <AdminSessionGate />
      </div>
    </div>
  );
}
