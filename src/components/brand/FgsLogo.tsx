import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { BRAND } from "@/config/brand";
import { shouldUseUnoptimizedImage } from "@/lib/upload-url";
import type { LogoDisplayMode } from "@/lib/brand-logo";

interface FgsLogoProps {
  href?: string;
  companyName?: string;
  showName?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  logoUrl?: string | null;
  logoMode?: LogoDisplayMode;
  logoHeight?: number;
}

const sizeMap = {
  sm: { height: 28, maxW: 140, title: "text-lg", sub: "text-[10px]", titlePx: 18, subPx: 10 },
  md: { height: 36, maxW: 180, title: "text-xl", sub: "text-[11px]", titlePx: 20, subPx: 11 },
  lg: { height: 44, maxW: 220, title: "text-2xl", sub: "text-xs", titlePx: 24, subPx: 12 },
};

function TextBrandMark({ size, logoHeight }: { size: "sm" | "md" | "lg"; logoHeight: number }) {
  const s = sizeMap[size];
  const scale = logoHeight / s.height;
  return (
    <span className="flex flex-col leading-none">
      <span
        className={cn(
          "font-extrabold tracking-tight text-primary-600 dark:text-primary-400",
          s.title
        )}
        style={{ fontSize: s.titlePx * scale }}
      >
        FGS
      </span>
      <span
        className={cn(
          "mt-0.5 font-medium normal-case tracking-wide text-slate-600 dark:text-slate-400",
          s.sub
        )}
        style={{ fontSize: s.subPx * scale }}
      >
        Software
      </span>
    </span>
  );
}

export function FgsLogo({
  href,
  size = "md",
  className,
  logoUrl,
  logoMode = "text",
  logoHeight,
}: FgsLogoProps) {
  const s = sizeMap[size];
  const height = logoHeight ?? s.height;
  const useImage = logoMode === "image" && Boolean(logoUrl?.trim());
  const src = logoUrl?.split("?")[0] ?? BRAND.logoPath;
  const imageWidth = Math.round(height * BRAND.logoAspectRatio);
  const maxWidth = Math.min(s.maxW * (height / s.height), 300);

  const content = (
    <span
      className={cn("inline-flex max-w-full items-center", className)}
      style={{ height, maxWidth }}
    >
      {useImage ? (
        <span
          className="relative flex shrink-0 items-center justify-center bg-transparent"
          style={{
            height,
            width: imageWidth,
            minWidth: imageWidth,
            maxWidth,
          }}
        >
          <Image
            src={src}
            alt={BRAND.logoAlt}
            width={imageWidth}
            height={height}
            className="h-full w-auto max-w-full object-contain object-left"
            unoptimized={shouldUseUnoptimizedImage(src) || src === BRAND.logoPath}
            priority={size === "md"}
          />
        </span>
      ) : (
        <TextBrandMark size={size} logoHeight={height} />
      )}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex cursor-pointer transition-opacity hover:opacity-90"
        style={{ height, maxWidth }}
      >
        {content}
      </Link>
    );
  }

  return content;
}
