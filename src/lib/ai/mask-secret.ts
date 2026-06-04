export function maskSecret(value: string | undefined | null): string {
  if (!value?.trim()) return "";
  const v = value.trim();
  if (v.length <= 8) return "••••••••";
  return `${v.slice(0, 4)}${"•".repeat(Math.min(12, v.length - 8))}${v.slice(-4)}`;
}

/** One bullet per character — matches password field length after save. */
export function maskSecretForInput(value: string | undefined | null): string | null {
  if (!value?.trim()) return null;
  return "•".repeat(value.trim().length);
}

export function isMaskedOrEmpty(value: string, original?: string): boolean {
  if (!value.trim()) return true;
  if (value.includes("•")) return true;
  return original !== undefined && value === original;
}
