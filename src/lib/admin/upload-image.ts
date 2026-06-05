import { newUploadFilename, persistUploadBuffer } from "@/lib/admin/upload-storage";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);
const MAX_BYTES = 5 * 1024 * 1024;

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

function inferMimeFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "";
}

export async function saveUploadedImage(file: File): Promise<string> {
  const mime =
    file.type && file.type !== "application/octet-stream"
      ? file.type
      : inferMimeFromName(file.name) || "image/jpeg";
  if (!ALLOWED_TYPES.has(mime)) {
    throw new Error("INVALID_TYPE");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }

  const ext = EXT_BY_MIME[mime] ?? "jpg";
  const filename = newUploadFilename(ext);
  const buffer = Buffer.from(await file.arrayBuffer());
  return persistUploadBuffer("uploads", filename, buffer, mime);
}
