/** True when a stored/env API key is present and not a UI mask placeholder. */
export function isUsableApiKey(key: string | null | undefined): key is string {
  if (!key?.trim()) return false;
  const v = key.trim();
  if (v.includes("•") || v.includes("****")) return false;
  return v.length >= 8;
}
