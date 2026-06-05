/** Strip cache-busting query string; keep path or absolute URL. */
export function normalizeUploadSrc(src: string | null | undefined): string | null {
  if (!src?.trim()) return null;
  return src.split("?")[0].trim() || null;
}

/** True for paths served from local disk, Cloudinary, or Vercel Blob. */
export function isManagedUploadUrl(src: string): boolean {
  const base = normalizeUploadSrc(src);
  if (!base) return false;
  if (base.startsWith("/uploads/")) return true;
  try {
    const host = new URL(base).hostname;
    return (
      host.endsWith(".blob.vercel-storage.com") ||
      host.endsWith(".public.blob.vercel-storage.com") ||
      host === "res.cloudinary.com"
    );
  } catch {
    return false;
  }
}

/** Load upload URLs directly — avoids next/image remote config issues on Vercel. */
export function shouldUseUnoptimizedImage(src: string): boolean {
  return isManagedUploadUrl(src);
}
