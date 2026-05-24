import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { BRAND } from "@/config/brand";

interface FgsLogoProps {
  href?: string;
  companyName?: string;
  showName?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { image: 32, text: "text-base" },
  md: { image: 40, text: "text-lg" },
  lg: { image: 48, text: "text-xl" },
};

export function FgsLogo({
  href,
  companyName,
  showName = true,
  size = "md",
  className,
}: FgsLogoProps) {
  const dimensions = sizeMap[size];
  const label = companyName ?? BRAND.companyName;

  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        src={BRAND.logoPath}
        alt={BRAND.logoAlt}
        width={dimensions.image}
        height={dimensions.image}
        className="shrink-0 rounded-xl"
        priority
      />
      {showName && (
        <span
          className={cn(
            "font-bold tracking-tight text-primary-700 dark:text-primary-300",
            dimensions.text
          )}
        >
          {label}
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="cursor-pointer transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
