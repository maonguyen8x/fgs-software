import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { isCloudinaryConfigured, uploadToCloudinary } from "@/lib/admin/upload-cloudinary";

type UploadBackend = "cloudinary" | "blob" | "local";

function useBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

function resolveUploadBackend(): UploadBackend {
  const preference = process.env.UPLOAD_STORAGE?.trim().toLowerCase();
  if (preference === "cloudinary" && isCloudinaryConfigured()) return "cloudinary";
  if (preference === "blob" && useBlobStorage()) return "blob";
  if (preference === "local") return "local";
  if (isCloudinaryConfigured()) return "cloudinary";
  if (useBlobStorage()) return "blob";
  return "local";
}

async function saveToBlob(key: string, buffer: Buffer, contentType: string): Promise<string> {
  const blob = await put(key, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });
  return blob.url;
}

async function saveToLocalDisk(relativePath: string, buffer: Buffer): Promise<string> {
  const fullPath = path.join(process.cwd(), "public", relativePath);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, buffer);
  return `/${relativePath.replace(/\\/g, "/")}`;
}

export async function persistUploadBuffer(
  folder: string,
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const key = `${folder}/${filename}`.replace(/^\/+/, "");
  const resourceType = contentType.startsWith("video/") ? "video" : "image";

  const backend = resolveUploadBackend();

  if (backend === "cloudinary") {
    return uploadToCloudinary(folder, filename, buffer, resourceType);
  }

  if (backend === "blob") {
    return saveToBlob(key, buffer, contentType);
  }

  return saveToLocalDisk(key, buffer);
}

export function newUploadFilename(ext: string): string {
  return `${randomUUID()}.${ext}`;
}
