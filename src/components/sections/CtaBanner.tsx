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
      <div className="container-narrow rounded-3xl bg-gradient-to-r from-primary-600 to-primary-500 px-8 py-16 text-center text-white shadow-xl">
        <h2 className="text-3xl font-bold md:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-primary-100">{subtitle}</p>
        <Button asChild size="lg" variant="secondary" className="mt-8">
          <Link href={href}>{buttonLabel}</Link>
        </Button>
      </div>
    </section>
  );
}
