export function adminDraftSettingKey(userId: string, scope: string): string {
  const safeScope = scope.replace(/[^a-z0-9_-]/gi, "_").slice(0, 64);
  return `admin_draft_${userId}_${safeScope}`;
}

export function parseDraftPayload(raw: string | undefined): Record<string, string> | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).map(([k, v]) => [k, String(v ?? "")])
    );
  } catch {
    return null;
  }
}
