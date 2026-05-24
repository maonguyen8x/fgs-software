/** Strip control characters and trim user text input. */
export function sanitizeText(input: string, maxLength: number): string {
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim()
    .slice(0, maxLength);
}

/** Basic email normalization. */
export function sanitizeEmail(email: string): string {
  return sanitizeText(email.toLowerCase(), 254);
}
