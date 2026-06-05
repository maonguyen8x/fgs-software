"use client";

import { useSession } from "next-auth/react";
import { AdminUserMenu } from "@/components/admin/AdminUserMenu";
import { AdminSessionProvider } from "@/components/providers/AdminSessionProvider";

/** Renders admin menu client-side only — avoids blocking public navigations on getServerSession. */
export function AdminSessionGate() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <AdminSessionProvider session={session}>
      <AdminUserMenu />
    </AdminSessionProvider>
  );
}
