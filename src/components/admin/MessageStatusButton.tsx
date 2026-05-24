"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function MessageStatusButton({ id, currentStatus }: { id: string; currentStatus: string }) {
  const router = useRouter();
  const nextStatus = currentStatus === "unread" ? "read" : currentStatus === "read" ? "done" : "unread";

  const update = async () => {
    await fetch(`/api/admin/messages/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    router.refresh();
  };

  return (
    <Button variant="outline" size="sm" onClick={update}>
      Mark as {nextStatus}
    </Button>
  );
}
