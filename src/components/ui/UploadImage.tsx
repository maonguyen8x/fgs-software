import Image, { type ImageProps } from "next/image";
import { shouldUseUnoptimizedImage } from "@/lib/upload-url";

type UploadImageProps = Omit<ImageProps, "unoptimized"> & {
  src: string;
};

/** next/image wrapper for admin uploads (local, Vercel Blob, Cloudinary). */
export function UploadImage({ src, ...props }: UploadImageProps) {
  return <Image src={src} unoptimized={shouldUseUnoptimizedImage(src)} {...props} />;
}
