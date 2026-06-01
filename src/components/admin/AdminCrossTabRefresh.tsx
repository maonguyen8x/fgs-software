"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_REFRESH_STORAGE_KEY } from "@/lib/admin/notify-admin-refresh";

export function AdminCrossTabRefresh() {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => router.refresh();

    const onStorage = (event: StorageEvent) => {
      if (event.key === ADMIN_REFRESH_STORAGE_KEY) refresh();
    };

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("fgs-admin");
      channel.onmessage = (event: MessageEvent<{ type?: string }>) => {
        if (event.data?.type === "refresh") refresh();
      };
    } catch {
      /* unsupported */
    }

    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      channel?.close();
    };
  }, [router]);

  return null;
}
