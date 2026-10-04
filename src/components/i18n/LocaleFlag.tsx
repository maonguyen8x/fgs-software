import { useId } from "react";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/** 5-point star polygon (outer radius 6, centered at 15,10) for the Vietnam flag. */
const VN_STAR_POINTS = Array.from({ length: 10 }, (_, i) => {
  const radius = i % 2 === 0 ? 6 : 6 * 0.382;
  const angle = (Math.PI / 5) * i - Math.PI / 2;
  return `${(15 + radius * Math.cos(angle)).toFixed(3)},${(10 + radius * Math.sin(angle)).toFixed(3)}`;
}).join(" ");

function UkFlag() {
  const id = useId();
  const clipFlag = `${id}-s`;
  const clipDiagonal = `${id}-t`;
  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <clipPath id={clipFlag}>
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id={clipDiagonal}>
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath={`url(#${clipFlag})`}>
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path
          d="M0,0 L60,30 M60,0 L0,30"
          clipPath={`url(#${clipDiagonal})`}
          stroke="#C8102E"
          strokeWidth="4"
        />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

function JapanFlag() {
  return (
    <svg viewBox="0 0 900 600" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <rect width="900" height="600" fill="#fff" />
      <circle cx="450" cy="300" r="180" fill="#BC002D" />
    </svg>
  );
}

function VietnamFlag() {
  return (
    <svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <rect width="30" height="20" fill="#DA251D" />
      <polygon points={VN_STAR_POINTS} fill="#FFFF00" />
    </svg>
  );
}

const FLAGS: Record<Locale, () => React.JSX.Element> = {
  en: UkFlag,
  ja: JapanFlag,
  vi: VietnamFlag,
};

/**
 * Circular SVG flag. Emoji flags are not rendered on Windows (they fall back to
 * letters like "GB"), so flags are drawn inline instead.
 */
export function LocaleFlag({ locale, className }: { locale: Locale; className?: string }) {
  const Flag = FLAGS[locale];
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-5 w-5 shrink-0 overflow-hidden rounded-full ring-1 ring-black/10 dark:ring-white/15",
        className
      )}
    >
      <Flag />
    </span>
  );
}
