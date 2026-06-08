"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAVIGATE_EVENT } from "@/components/admin/AdminNavProgress";
import { getAdminScrollRoot } from "@/lib/admin/scroll-to-section";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderKanban,
  FileText,
  Layout,
  Mail,
  MessageSquare,
  Settings,
  LogOut,
  Building2,
  History,
  Camera,
  Gem,
  Handshake,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FgsLogo } from "@/components/brand/FgsLogo";
import { getPublicAdminLoginUrl } from "@/config/admin-public";
import type { LogoDisplayMode } from "@/lib/brand-logo";

const linkKeys = [
  { href: "/admin/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/admin/team", key: "team", icon: Users },
  { href: "/admin/timeline", key: "timeline", icon: History },
  { href: "/admin/activities", key: "activities", icon: Camera },
  { href: "/admin/core-values", key: "core_values", icon: Gem },
  { href: "/admin/branches", key: "branches", icon: Building2 },
  { href: "/admin/services", key: "services", icon: Briefcase },
  { href: "/admin/works", key: "works", icon: FolderKanban },
  { href: "/admin/partners", key: "partners", icon: Handshake },
  { href: "/admin/blog", key: "blog", icon: FileText },
  { href: "/admin/messages", key: "messages", icon: Mail },
  { href: "/admin/chat", key: "chat", icon: MessageSquare },
  { href: "/admin/pages", key: "pages", icon: Layout },
  { href: "/admin/settings", key: "settings", icon: Settings },
] as const;

export function AdminSidebar({
  userName,
  logoUrl,
  logoMode = "text",
}: {
  userName: string;
  logoUrl?: string | null;
  logoMode?: LogoDisplayMode;
}) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const t = useTranslations("admin.sidebar");

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const isLinkActive = (href: string) => {
    if (pendingHref === href) return true;
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`) ||
      (href === "/admin/team" && pathname.startsWith("/admin/founders"))
    );
  };

  const handleNavClick = (href: string) => {
    const alreadyThere =
      pathname === href ||
      pathname.startsWith(`${href}/`) ||
      (href === "/admin/team" && pathname.startsWith("/admin/founders"));
    if (alreadyThere) return;

    setPendingHref(href);
    getAdminScrollRoot()?.scrollTo({ top: 0, behavior: "instant" });
    window.dispatchEvent(new Event(ADMIN_NAVIGATE_EVENT));
  };

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-theme bg-surface">
      <div className="shrink-0 border-b border-theme bg-surface p-4">
        <Link href="/" className="inline-flex cursor-pointer rounded-lg transition-opacity hover:opacity-90">
          <FgsLogo size="sm" logoUrl={logoUrl} logoMode={logoMode} />
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {linkKeys.map(({ href, key, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            prefetch={true}
            scroll={false}
            onClick={() => handleNavClick(href)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isLinkActive(href)
                ? "bg-primary-50 text-primary-700"
                : "text-slate-600 hover:bg-slate-50",
              pendingHref === href && "opacity-80"
            )}
          >
            <Icon className="h-4 w-4" />
            {t(key)}
          </Link>
        ))}
      </nav>
      <div className="shrink-0 border-t border-theme bg-surface p-4">
        <Button
          variant="ghost"
          className="w-full cursor-pointer justify-start"
          onClick={() => signOut({ callbackUrl: getPublicAdminLoginUrl() })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
