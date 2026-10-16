"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DeleteServiceButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${title}?`)) return;
    try {
      const response = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
      if (!response.ok) {
        toast.error("Failed to delete service");
        return;
      }
      toast.success("Service deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete service");
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={() => void handleDelete()}>
      Delete
    </Button>
  );
}
