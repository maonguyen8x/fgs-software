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

/** Use the actual image URL when an image-search result page is pasted. */
export function resolveUploadImageSrc(src: string): string {
  try {
    const url = new URL(src);
    if (
      (url.hostname === "google.com" || url.hostname === "www.google.com") &&
      url.pathname === "/imgres"
    ) {
      const imageUrl = url.searchParams.get("imgurl");
      if (imageUrl && ["http:", "https:"].includes(new URL(imageUrl).protocol)) {
        return imageUrl;
      }
    }
  } catch {
    return src;
  }
  return src;
}

/** Skip optimization for user-provided remote URLs that are not in next.config. */
export function shouldUseUnoptimizedImage(src: string): boolean {
  if (isManagedUploadUrl(src)) return true;
  try {
    const protocol = new URL(src).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}
