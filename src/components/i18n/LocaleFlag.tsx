import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/** 5-point star polygon (outer radius 6, centered at 15,10) for the Vietnam flag. */
const VN_STAR_POINTS = Array.from({ length: 10 }, (_, i) => {
  const radius = i % 2 === 0 ? 6 : 6 * 0.382;
  const angle = (Math.PI / 5) * i - Math.PI / 2;
  return `${(15 + radius * Math.cos(angle)).toFixed(3)},${(10 + radius * Math.sin(angle)).toFixed(3)}`;
}).join(" ");

function UkFlag() {
  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <path d="M0 0h60v30H0z" fill="#012169" />
      <path d="M0 0 60 30M60 0 0 30" stroke="#fff" strokeWidth="6" />
      <path d="M0 0 60 30M60 0 0 30" stroke="#C8102E" strokeWidth="2.4" />
      <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
      <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
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
