import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { BRAND } from "@/config/brand";
import type { LogoDisplayMode } from "@/lib/brand-logo";

interface FgsLogoProps {
  href?: string;
  companyName?: string;
  showName?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  logoUrl?: string | null;
  logoMode?: LogoDisplayMode;
}

const sizeMap = {
  sm: { height: 28, maxW: 140, title: "text-lg", sub: "text-[10px]" },
  md: { height: 36, maxW: 180, title: "text-xl", sub: "text-[11px]" },
  lg: { height: 44, maxW: 220, title: "text-2xl", sub: "text-xs" },
};

function TextBrandMark({ size }: { size: "sm" | "md" | "lg" }) {
  const s = sizeMap[size];
  return (
    <span className="flex flex-col leading-none">
      <span
        className={cn(
          "font-extrabold tracking-tight text-primary-600 dark:text-primary-400",
          s.title
        )}
      >
        FGS
      </span>
      <span
        className={cn(
          "mt-0.5 font-medium normal-case tracking-wide text-slate-600 dark:text-slate-400",
          s.sub
        )}
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
}: FgsLogoProps) {
  const s = sizeMap[size];
  const useImage = logoMode === "image" && Boolean(logoUrl?.trim());
  const src = logoUrl?.split("?")[0] ?? BRAND.logoPngPath;
  const imageWidth = Math.round(s.height * BRAND.logoAspectRatio);

  const content = (
    <span
      className={cn("inline-flex max-w-full items-center", className)}
      style={{ maxWidth: s.maxW }}
    >
      {useImage ? (
        <span
          className="relative flex shrink-0 items-center justify-center bg-transparent"
          style={{
            height: s.height,
            width: imageWidth,
            minWidth: imageWidth,
            maxWidth: s.maxW,
          }}
        >
          <Image
            src={src}
            alt={BRAND.logoAlt}
            width={imageWidth}
            height={s.height}
            className="h-full w-auto max-w-full object-contain object-left"
            unoptimized={src.startsWith("/uploads/")}
            priority={size === "md"}
          />
        </span>
      ) : (
        <TextBrandMark size={size} />
      )}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex cursor-pointer transition-opacity hover:opacity-90"
        style={{ maxWidth: s.maxW }}
      >
        {content}
      </Link>
    );
  }

  return content;
}
