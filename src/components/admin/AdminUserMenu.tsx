"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { LogOut, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPublicAdminLoginUrl } from "@/config/admin-public";
import { AdminProfileDialog } from "./AdminProfileDialog";

interface AdminUserMenuProps {
  initialName?: string;
  className?: string;
}

interface ProfileSnapshot {
  name: string;
  avatar: string | null;
}

export function AdminUserMenu({ initialName, className }: AdminUserMenuProps) {
  const t = useTranslations("admin.header");
  const { data: session, update: updateSession } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileSnapshot | null>(null);

  const refreshProfile = useCallback(
    async (syncSession = false) => {
      try {
        const res = await fetch("/api/admin/profile", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as ProfileSnapshot & { email?: string };
        setProfile({ name: data.name, avatar: data.avatar });
        if (syncSession) {
          await updateSession({
            name: data.name,
            image: data.avatar ?? undefined,
          });
        }
      } catch {
        /* ignore */
      }
    },
    [updateSession],
  );

  useEffect(() => {
    if (session?.user) void refreshProfile(false);
  }, [session?.user?.email, refreshProfile]);

  if (!session?.user) return null;

  const displayName = profile?.name ?? session.user.name ?? initialName ?? "Admin";
  const avatarUrl = profile?.avatar ?? session.user.image ?? null;
  const avatarSrc = avatarUrl
    ? avatarUrl.includes("?")
      ? avatarUrl
      : `${avatarUrl}?v=${encodeURIComponent(displayName)}`
    : null;

  return (
    <>
      <div
        className={cn("relative", className)}
        onMouseEnter={() => setMenuOpen(true)}
        onMouseLeave={() => setMenuOpen(false)}
      >
        <div
          className="group flex cursor-pointer items-center gap-2 rounded-full bg-slate-100/95 py-1 pl-1 pr-3 shadow-sm transition-all duration-200 hover:bg-slate-200/90 dark:bg-slate-800/90 dark:hover:bg-slate-700/90"
          role="button"
          tabIndex={0}
          aria-haspopup="true"
          aria-expanded={menuOpen}
        >
          {avatarSrc ? (
            <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-primary-600 ring-offset-1 ring-offset-slate-100 transition-shadow group-hover:ring-primary-500 dark:ring-offset-slate-800">
              <Image
                src={avatarSrc}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 object-cover"
                unoptimized={avatarSrc.startsWith("/uploads/")}
              />
            </span>
          ) : (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-700 ring-2 ring-primary-600 ring-offset-1 ring-offset-slate-100 dark:ring-offset-slate-800">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="hidden max-w-[180px] truncate text-sm font-semibold text-slate-700 md:inline-block dark:text-slate-200">
            {displayName}
          </span>
        </div>

        {menuOpen && (
          <div className="absolute right-0 top-full z-50 pt-2">
            <div className="w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
              <button
                type="button"
                className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  setMenuOpen(false);
                  setProfileOpen(true);
                }}
              >
                <User className="h-4 w-4 text-primary-600" />
                {t("profile")}
              </button>
              <Link
                href="/admin/settings"
                className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setMenuOpen(false)}
              >
                <Settings className="h-4 w-4 text-primary-600" />
                {t("settings")}
              </Link>
              <button
                type="button"
                className="flex w-full cursor-pointer items-center gap-2.5 border-t border-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  setMenuOpen(false);
                  void signOut({ callbackUrl: getPublicAdminLoginUrl() });
                }}
              >
                <LogOut className="h-4 w-4 text-red-500" />
                {t("logout")}
              </button>
            </div>
          </div>
        )}
      </div>
      <AdminProfileDialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onSaved={() => void refreshProfile(true)}
      />
    </>
  );
}
