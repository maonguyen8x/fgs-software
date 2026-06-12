"use client";

import { useCallback, useEffect, useRef } from "react";

type DraftValues = Record<string, string>;

interface UseAdminSettingsDraftOptions<T extends DraftValues> {
  scope: string;
  values: T;
  setValues: (next: T | ((prev: T) => T)) => void;
  enabled?: boolean;
  debounceMs?: number;
}

/** Server-side draft autosave (no localStorage / sessionStorage). */
export function useAdminSettingsDraft<T extends DraftValues>({
  scope,
  values,
  setValues,
  enabled = true,
  debounceMs = 2000,
}: UseAdminSettingsDraftOptions<T>) {
  const hydratedRef = useRef(false);
  const skipNextSaveRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadDraft = useCallback(async () => {
    const res = await fetch(`/api/admin/settings/drafts?scope=${encodeURIComponent(scope)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { data?: DraftValues; hasDraft?: boolean };
    if (!data.hasDraft || !data.data) return null;
    return data.data;
  }, [scope]);

  const clearDraft = useCallback(async () => {
    await fetch(`/api/admin/settings/drafts?scope=${encodeURIComponent(scope)}`, {
      method: "DELETE",
    });
  }, [scope]);

  useEffect(() => {
    if (!enabled || hydratedRef.current) return;
    hydratedRef.current = true;

    void (async () => {
      const draft = await loadDraft();
      if (!draft || Object.keys(draft).length === 0) return;
      skipNextSaveRef.current = true;
      setValues((prev) => ({ ...prev, ...draft }) as T);
    })();
  }, [enabled, loadDraft, setValues]);

  useEffect(() => {
    if (!enabled || !hydratedRef.current) return;

    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void fetch("/api/admin/settings/drafts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, data: values }),
      });
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, scope, values, debounceMs]);

  return { clearDraft, loadDraft };
}
