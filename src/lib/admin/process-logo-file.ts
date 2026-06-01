import { BRAND } from "@/config/brand";

const RASTER_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const SVG_TYPE = "image/svg+xml";
const SVG_MAX_BYTES = 512 * 1024;

function inferMime(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith(".svg")) return SVG_TYPE;
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "";
}

export type LogoProcessError = "INVALID_TYPE" | "FILE_TOO_LARGE" | "PROCESS_FAILED";

export async function processLogoFile(file: File): Promise<File> {
  const mime = file.type || inferMime(file.name);
  const maxPx = BRAND.logoUploadMaxPx;

  if (mime === SVG_TYPE) {
    if (file.size > SVG_MAX_BYTES) throw new Error("FILE_TOO_LARGE");
    return file;
  }

  if (!RASTER_TYPES.has(mime)) {
    throw new Error("INVALID_TYPE");
  }

  if (file.size > 8 * 1024 * 1024) {
    throw new Error("FILE_TOO_LARGE");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(maxPx / bitmap.width, maxPx / bitmap.height, 1);
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("PROCESS_FAILED");

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/png", 0.92);
  });
  if (!blob) throw new Error("PROCESS_FAILED");

  return new File([blob], "logo.png", { type: "image/png" });
}
