"use client";

import { AdminUserMenu } from "./AdminUserMenu";

interface AdminTopBarProps {
  initialName?: string;
}

export function AdminTopBar({ initialName }: AdminTopBarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-end border-b border-slate-200/90 bg-white px-6 shadow-sm">
      <AdminUserMenu initialName={initialName} />
    </header>
  );
}
