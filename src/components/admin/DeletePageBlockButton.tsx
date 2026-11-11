"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { showAdminErrorToast, showAdminSuccessToast } from "@/lib/admin-toast";
import { Trash2 } from "lucide-react";

export function DeletePageBlockButton({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    if (!window.confirm(`Delete the "${label}" content block?`)) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/page-blocks/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const result = (await response.json().catch(() => ({}))) as { error?: string };
        showAdminErrorToast(result.error || "Failed to delete content block.");
        return;
      }
      showAdminSuccessToast("Content block deleted");
      router.refresh();
    } catch (error) {
      showAdminErrorToast(error instanceof Error ? error.message : "Unable to reach the server.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={deleting}
      onClick={() => void remove()}
      className="cursor-pointer border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
    >
      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
      {deleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
