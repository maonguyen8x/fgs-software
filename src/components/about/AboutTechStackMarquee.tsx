import { useTranslations } from "next-intl";
import {
  TECH_STACK_PRIMARY,
  TECH_STACK_SECONDARY,
  type TechStackItem,
} from "@/components/about/tech-stack-icons";

/** Logo màu tối (Next.js, Vercel...) sẽ không thấy trên nền tối → đổi sang trắng khi dark mode */
function darkModeColor(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.3 ? "#f8fafc" : hex;
}

function TechPill({ item, hidden }: { item: TechStackItem; hidden?: boolean }) {
  return (
    <li
      className="tech-pill mx-2 flex shrink-0 items-center gap-2.5 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2.5 shadow-sm backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/70 md:px-5 md:py-3"
      style={
        {
          "--tech-color": item.color,
          "--tech-color-dark": darkModeColor(item.color),
        } as React.CSSProperties
      }
      aria-hidden={hidden || undefined}
    >
      <svg
        viewBox="0 0 24 24"
        className="tech-pill-icon h-5 w-5 shrink-0 md:h-6 md:w-6"
        fill={item.stroke ? "none" : "currentColor"}
        stroke={item.stroke ? "currentColor" : undefined}
        strokeWidth={item.stroke ? 2 : undefined}
        strokeLinecap={item.stroke ? "round" : undefined}
        strokeLinejoin={item.stroke ? "round" : undefined}
        aria-hidden
      >
        {item.paths.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>
      <span className="whitespace-nowrap text-sm font-semibold text-slate-700 dark:text-slate-200 md:text-[15px]">
        {item.name}
      </span>
    </li>
  );
}

function MarqueeRow({ items, reverse, label }: { items: TechStackItem[]; reverse?: boolean; label: string }) {
  return (
    <div className="tech-marquee-row relative w-full overflow-hidden py-1.5">
      <ul
        className="tech-marquee-track flex w-max items-center"
        data-reverse={reverse || undefined}
        style={{ "--marquee-duration": `${items.length * 3.2}s` } as React.CSSProperties}
        aria-label={label}
      >
        {items.map((item) => (
          <TechPill key={item.key} item={item} />
        ))}
        {/* Bản sao để vòng chạy liền mạch, ẩn với trình đọc màn hình */}
        {items.map((item) => (
          <TechPill key={`${item.key}-dup`} item={item} hidden />
        ))}
      </ul>
    </div>
  );
}

export function AboutTechStackMarquee() {
  const t = useTranslations("about.tech_stack");

  return (
    <section className="tech-marquee-section relative w-full overflow-hidden py-8 md:py-10">
      <div className="container-narrow px-4 text-center">
        <h2 className="about-accent-heading">{t("title")}</h2>
        <p className="mx-auto max-w-2xl pb-5 text-sm leading-relaxed text-muted-theme md:pb-6">
          {t("subtitle")}
        </p>
      </div>

      <div className="tech-marquee-viewport flex flex-col gap-2 md:gap-3">
        <MarqueeRow items={TECH_STACK_PRIMARY} label={t("aria")} />
        <MarqueeRow items={TECH_STACK_SECONDARY} label={t("aria")} reverse />
      </div>
    </section>
  );
}
