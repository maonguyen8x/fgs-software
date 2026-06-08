"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export const ADMIN_NAVIGATE_EVENT = "fgs-admin-navigate";

export function AdminNavProgress() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setPending(false);
  }, [pathname]);

  useEffect(() => {
    const onNavigate = () => setPending(true);
    window.addEventListener(ADMIN_NAVIGATE_EVENT, onNavigate);
    return () => window.removeEventListener(ADMIN_NAVIGATE_EVENT, onNavigate);
  }, []);

  if (!pending) return null;

  return (
    <div
      className="pointer-events-none sticky top-0 z-50 h-0.5 w-full overflow-hidden bg-primary-100"
      aria-hidden
    >
      <div className="h-full w-1/3 animate-[admin-nav-slide_0.9s_ease-in-out_infinite] bg-primary-500" />
    </div>
  );
}
