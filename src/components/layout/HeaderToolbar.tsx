"use client";

import type { Session } from "next-auth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AdminUserMenu } from "@/components/admin/AdminUserMenu";
import { AdminSessionProvider } from "@/components/providers/AdminSessionProvider";

/** Shared header controls (theme + language + admin menu when logged in). */
export function HeaderToolbar({
  className,
  adminSession,
}: {
  className?: string;
  adminSession?: Session | null;
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <LanguageSwitcher />
        {adminSession?.user ? (
          <AdminSessionProvider session={adminSession}>
            <AdminUserMenu />
          </AdminSessionProvider>
        ) : null}
      </div>
    </div>
  );
}
