import { useTranslations } from "next-intl";
import {
  TECH_STACK_PRIMARY,
  TECH_STACK_SECONDARY,
  type TechStackItem,
} from "@/components/about/tech-stack-icons";

function resolveTechStack(
  entries: Array<{ key: string; name: string; color: string; glyph?: string }>,
  source: TechStackItem[]
): TechStackItem[] {
  return entries.map((entry) => {
    const existing = source.find((item) => item.key === entry.key);
    return existing
      ? { ...existing, name: entry.name }
      : { ...entry, paths: [] };
  });
}

const ICON_LIBRARY = [
  ...resolveTechStack(
  [
    { key: "java", name: "Java", color: "#ED8B00", glyph: "J" },
    { key: "javascript", name: "JavaScript", color: "#F7DF1E" },
    { key: "typescript", name: "TypeScript", color: "#3178C6" },
    { key: "react", name: "ReactJS", color: "#61DAFB" },
    { key: "nestjs", name: "NestJS", color: "#E0234E", glyph: "N" },
    { key: "nextjs", name: "NextJS", color: "#000000" },
    { key: "python", name: "Python", color: "#3776AB" },
    { key: "csharp", name: "C#", color: "#512BD4" },
    { key: "cpp", name: "C++", color: "#00599C", glyph: "C++" },
    { key: "dotnet", name: ".NET", color: "#512BD4" },
    { key: "tailwind", name: "TailwindCSS", color: "#06B6D4" },
    { key: "prisma", name: "Prisma", color: "#2D3748" },
    { key: "bootstrap", name: "Bootstrap", color: "#7952B3", glyph: "B" },
    { key: "aws", name: "AWS Cloud", color: "#FF9900", glyph: "AWS" },
    { key: "azure", name: "Azure", color: "#0078D4", glyph: "A" },
  ],
  TECH_STACK_PRIMARY
  ),
  ...resolveTechStack(
  [
    { key: "mongodb", name: "MongoDB", color: "#47A248" },
    { key: "redis", name: "Redis", color: "#D82C20" },
    { key: "sqlserver", name: "SQL Server", color: "#CC2927", glyph: "SQL" },
    { key: "postgresql", name: "PostgreSQL", color: "#4169E1" },
    { key: "memcache", name: "Memcache", color: "#2D6A8A", glyph: "M" },
    { key: "elasticsearch", name: "Elasticsearch", color: "#FEC514", glyph: "E" },
    { key: "mysql", name: "MySQL", color: "#4479A1", glyph: "My" },
  ],
  TECH_STACK_SECONDARY
  ),
];

const TECH_ALIASES: Record<string, string> = {
  awscloud: "aws",
  c: "csharp",
  dotnet: "dotnet",
  reactjs: "react",
  tailwindcss: "tailwind",
};

interface AboutTechStackItem {
  id: string;
  name: string;
  category: string;
}

function mapTechStackItem(entry: AboutTechStackItem): TechStackItem {
  const normalizedName = entry.name.toLowerCase().replace(/[^a-z0-9]/g, "");
  const key = TECH_ALIASES[normalizedName] ?? normalizedName;
  const icon = ICON_LIBRARY.find(
    (item) =>
      item.key === key ||
      item.name.toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedName
  );

  return icon
    ? { ...icon, name: entry.name }
    : {
        key: `custom-${entry.id}`,
        name: entry.name,
        color: "#64748b",
        paths: [],
        glyph: entry.name.slice(0, 3).toUpperCase(),
      };
}

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
        {item.glyph ? (
          <text
            x="12"
            y="16"
            textAnchor="middle"
            fontSize={item.glyph.length > 2 ? "7" : "11"}
            fontWeight="700"
            fontFamily="Arial, sans-serif"
          >
            {item.glyph}
          </text>
        ) : (
          item.paths.map((d, i) => <path key={i} d={d} />)
        )}
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

export function AboutTechStackMarquee({ items }: { items: AboutTechStackItem[] }) {
  const t = useTranslations("about.tech_stack");
  const primaryTech = items
    .filter((item) => item.category !== "database")
    .map(mapTechStackItem);
  const secondaryTech = items
    .filter((item) => item.category === "database")
    .map(mapTechStackItem);

  if (items.length === 0) return null;

  return (
    <section className="tech-marquee-section relative w-full overflow-hidden py-8 md:py-10">
      <div className="container-narrow px-4 text-center">
        <h2 className="about-accent-heading">{t("title")}</h2>
        <p className="mx-auto max-w-2xl pb-5 text-sm leading-relaxed text-muted-theme md:pb-6">
          {t("subtitle")}
        </p>
      </div>

      <div className="tech-marquee-viewport flex flex-col gap-2 md:gap-3">
        {primaryTech.length > 0 ? <MarqueeRow items={primaryTech} label={t("aria")} reverse /> : null}
        {secondaryTech.length > 0 ? <MarqueeRow items={secondaryTech} label={t("aria")} /> : null}
      </div>
    </section>
  );
}
