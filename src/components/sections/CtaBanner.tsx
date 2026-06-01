import Link from "next/link";
import { Button } from "@/components/ui/button";

interface CtaBannerProps {
  title: string;
  subtitle: string;
  buttonLabel: string;
  href: string;
}

export function CtaBanner({ title, subtitle, buttonLabel, href }: CtaBannerProps) {
  return (
    <section className="section-padding">
      <div className="container-narrow relative overflow-hidden rounded-3xl bg-linear-to-r from-primary-600 via-primary-500 to-cyan-500 px-8 py-16 text-center text-white shadow-xl shadow-primary-600/30">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="relative">
        <h2 className="text-3xl font-bold md:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-primary-100">{subtitle}</p>
        <Button asChild size="lg" variant="secondary" className="mt-8">
          <Link href={href}>{buttonLabel}</Link>
        </Button>
        </div>
      </div>
    </section>
  );
}
