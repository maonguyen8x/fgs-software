import { newUploadFilename, persistUploadBuffer } from "@/lib/admin/upload-storage";

const ALLOWED_TYPES = new Set(["video/mp4", "video/webm"]);
const MAX_BYTES = 80 * 1024 * 1024;

const EXT_BY_MIME: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

function inferMimeFromName(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".webm")) return "video/webm";
  return "";
}

export async function saveUploadedVideo(file: File): Promise<string> {
  const mime = file.type || inferMimeFromName(file.name);
  if (!ALLOWED_TYPES.has(mime)) {
    throw new Error("INVALID_TYPE");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }

  const ext = EXT_BY_MIME[mime] ?? "mp4";
  const filename = newUploadFilename(ext);
  const buffer = Buffer.from(await file.arrayBuffer());
  return persistUploadBuffer("uploads/videos", filename, buffer, mime);
}
