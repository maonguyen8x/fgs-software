import { AiPhoneShowcase, type PhoneShowcaseProduct } from "@/components/showcase/AiPhoneShowcase";

export type ConceptProduct = PhoneShowcaseProduct;

interface ConceptProductsSectionProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  productLabel: string;
  products: ConceptProduct[];
}

export function ConceptProductsSection(props: ConceptProductsSectionProps) {
  return <AiPhoneShowcase {...props} />;
}
