"use client";

import { AdminSettingsLocaleSwitcher } from "@/components/admin/AdminSettingsLocaleSwitcher";

/** Settings page toolbar — admin UI language only (logout stays in sidebar). */
export function AdminSettingsToolbar() {
  return (
    <div className="mb-6 flex justify-end">
      <AdminSettingsLocaleSwitcher />
    </div>
  );
}
