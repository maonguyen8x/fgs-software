import Image, { type ImageProps } from "next/image";
import { resolveUploadImageSrc, shouldUseUnoptimizedImage } from "@/lib/upload-url";

type UploadImageProps = Omit<ImageProps, "unoptimized"> & {
  src: string;
};

/** next/image wrapper for uploads and user-provided remote image URLs. */
export function UploadImage({ src, ...props }: UploadImageProps) {
  const resolvedSrc = resolveUploadImageSrc(src);
  return <Image src={resolvedSrc} unoptimized={shouldUseUnoptimizedImage(resolvedSrc)} {...props} />;
}
