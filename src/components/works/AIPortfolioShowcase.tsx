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
  emptyTitle: string;
  emptyDescription: string;
}

export function AIPortfolioShowcase({
  eyebrow,
  title,
  subtitle,
  products,
  locale,
  productLabel,
  emptyTitle,
  emptyDescription,
}: AIPortfolioShowcaseProps) {
  return (
    <AiPhoneShowcase
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
      productLabel={productLabel}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
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
