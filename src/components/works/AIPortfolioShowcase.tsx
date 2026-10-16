import type { Work } from "@prisma/client";
import type { Locale } from "@/i18n/routing";
import { getLocalizedField } from "@/lib/i18n-content";
import { AiPhoneShowcase } from "@/components/showcase/AiPhoneShowcase";

interface AIPortfolioShowcaseProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  products: Work[];
  locale: Locale;
  productLabel: string;
}

export function AIPortfolioShowcase({
  eyebrow,
  title,
  subtitle,
  products,
  locale,
  productLabel,
}: AIPortfolioShowcaseProps) {
  return (
    <AiPhoneShowcase
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      productLabel={productLabel}
      products={products.map((product) => ({
        id: product.id,
        title: getLocalizedField(product, "title", locale),
        description: getLocalizedField(product, "summary", locale),
        features: product.techStack,
        appUrl: product.demoUrl,
      }))}
    />
  );
}
