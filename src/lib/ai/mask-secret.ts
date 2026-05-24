export function maskSecret(value: string | undefined | null): string {
  if (!value?.trim()) return "";
  const v = value.trim();
  if (v.length <= 8) return "••••••••";
  return `${v.slice(0, 4)}${"•".repeat(Math.min(12, v.length - 8))}${v.slice(-4)}`;
}

export function isMaskedOrEmpty(value: string, original?: string): boolean {
  if (!value.trim()) return true;
  if (value.includes("•")) return true;
  return original !== undefined && value === original;
}
