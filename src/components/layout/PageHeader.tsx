interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <section className="page-hero section-padding-compact">
      <div className="container-narrow text-center">
        <h1 className="page-title text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        {subtitle && <p className="page-subtitle mx-auto mt-3 max-w-2xl text-base md:text-lg">{subtitle}</p>}
      </div>
    </section>
  );
}
