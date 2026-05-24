"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  showHome?: boolean;
}

export function AdminPageHeader({
  title,
  description,
  backHref,
  showHome = true,
}: AdminPageHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-0.5 cursor-pointer shrink-0"
          onClick={() => (backHref ? router.push(backHref) : router.back())}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
      </div>
      {showHome && (
        <Button asChild variant="ghost" size="sm" className="cursor-pointer">
          <Link href="/admin/dashboard">
            <Home className="mr-1 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
      )}
    </div>
  );
}
