interface HomeSectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}

export function HomeSectionHeading({ title, subtitle, align = "center" }: HomeSectionHeadingProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  const marginClass = align === "center" ? "mb-10" : "mb-0";

  return (
    <div className={`${marginClass} max-w-2xl ${alignClass}`}>
      <div
        className={`mb-4 h-1 w-12 rounded-full bg-linear-to-r from-primary-500 to-cyan-400 ${
          align === "center" ? "mx-auto" : ""
        }`}
      />
      <h2 className="text-3xl font-bold tracking-tight text-heading md:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-3 text-base text-muted-theme md:text-lg">{subtitle}</p> : null}
    </div>
  );
}
