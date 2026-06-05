import { v2 as cloudinary } from "cloudinary";

let configured = false;

function ensureCloudinaryConfig(): void {
  if (configured) return;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("CLOUDINARY_NOT_CONFIGURED");
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  configured = true;
}

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
      process.env.CLOUDINARY_API_KEY?.trim() &&
      process.env.CLOUDINARY_API_SECRET?.trim()
  );
}

export async function uploadToCloudinary(
  folder: string,
  filename: string,
  buffer: Buffer,
  resourceType: "image" | "video"
): Promise<string> {
  ensureCloudinaryConfig();

  const publicId = filename.replace(/\.[^.]+$/, "");
  const cloudFolder = `fgs-software/${folder}`.replace(/\\/g, "/");

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: cloudFolder,
        public_id: publicId,
        resource_type: resourceType,
        overwrite: false,
        unique_filename: false,
      },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error("CLOUDINARY_UPLOAD_FAILED"));
          return;
        }
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}
