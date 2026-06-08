/** Detect provider quota / rate-limit failures (not expired keys or network errors). */
export function isQuotaRelatedError(message: string): boolean {
  return /429|quota|rate.?limit|exceeded your current quota|resource.?exhausted|too many requests/i.test(
    message
  );
}
