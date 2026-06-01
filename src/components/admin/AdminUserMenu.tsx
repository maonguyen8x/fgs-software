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
          className="group flex cursor-pointer items-center gap-2.5 py-1"
          role="button"
          tabIndex={0}
          aria-haspopup="true"
          aria-expanded={menuOpen}
        >
          {avatarSrc ? (
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-primary-100">
              <Image
                src={avatarSrc}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 object-cover"
                unoptimized={avatarSrc.startsWith("/uploads/")}
              />
            </span>
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="hidden max-w-[160px] items-center gap-1.5 truncate text-sm font-semibold text-slate-800 md:inline-flex">{displayName}</span>
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
