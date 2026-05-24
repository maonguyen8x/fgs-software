"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderKanban,
  FileText,
  Mail,
  MessageSquare,
  Settings,
  LogOut,
  Building2,
  History,
  Star,
  Gem,
  Handshake,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FgsLogo } from "@/components/brand/FgsLogo";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/team", label: "Team", icon: Users },
  { href: "/admin/founders", label: "Founders", icon: Star },
  { href: "/admin/timeline", label: "Timeline", icon: History },
  { href: "/admin/core-values", label: "Core Values", icon: Gem },
  { href: "/admin/branches", label: "Branches", icon: Building2 },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/works", label: "Works", icon: FolderKanban },
  { href: "/admin/partners", label: "Partners", icon: Handshake },
  { href: "/admin/blog", label: "Blog", icon: FileText },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-theme bg-surface">
      <div className="shrink-0 border-b border-theme bg-surface p-4">
        <Link href="/admin/settings" className="inline-flex cursor-pointer rounded-lg transition-opacity hover:opacity-90">
          <FgsLogo showName size="sm" />
        </Link>
        <p className="mt-2 truncate text-sm text-slate-500">{userName}</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === href || pathname.startsWith(`${href}/`)
                ? "bg-primary-50 text-primary-700"
                : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="shrink-0 border-t border-theme bg-surface p-4">
        <Button
          variant="ghost"
          className="w-full cursor-pointer justify-start"
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
