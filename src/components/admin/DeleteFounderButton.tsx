"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface DeleteFounderButtonProps {
  id: string;
  label: string;
  confirmMessage: string;
}

export function DeleteFounderButton({ id, label, confirmMessage }: DeleteFounderButtonProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm(confirmMessage)) return;
    const res = await fetch(`/api/admin/founders/${id}`, { method: "DELETE" });
    if (!res.ok) {
      window.alert(`HTTP ${res.status}`);
      return;
    }
    router.refresh();
  };

  return (
    <Button variant="destructive" size="sm" className="cursor-pointer" onClick={handleDelete}>
      {label}
    </Button>
  );
}
