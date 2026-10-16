import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  Bot,
  Building2,
  Globe,
  LayoutGrid,
  Plug,
  Shapes,
  ShoppingBag,
  Smartphone,
} from "lucide-react";

export const WORK_CATEGORY_ORDER = [
  "apps",
  "fintech",
  "enterprise",
  "ecommerce",
  "ai",
  "web",
  "mobile",
  "api",
  "other",
] as const;

export const WORK_CATEGORY_ICONS: Record<string, LucideIcon> = {
  all: LayoutGrid,
  apps: Smartphone,
  fintech: Banknote,
  enterprise: Building2,
  ecommerce: ShoppingBag,
  ai: Bot,
  web: Globe,
  mobile: Smartphone,
  api: Plug,
  other: Shapes,
};

export const WORK_CATEGORY_GRADIENTS: Record<string, string> = {
  apps: "linear-gradient(180deg, #c4b5fd 0%, #ede4ff 100%)",
  fintech: "linear-gradient(180deg, #a78bfa 0%, #e9d5ff 100%)",
  enterprise: "linear-gradient(180deg, #8b5cf6 0%, #d8b4fe 100%)",
  ecommerce: "linear-gradient(180deg, #f0abfc 0%, #fae8ff 100%)",
  ai: "linear-gradient(180deg, #7c5cff 0%, #ddd6fe 100%)",
  web: "linear-gradient(180deg, #93c5fd 0%, #e0efff 100%)",
  mobile: "linear-gradient(180deg, #c4b5fd 0%, #ede4ff 100%)",
  api: "linear-gradient(180deg, #a5b4fc 0%, #e0e7ff 100%)",
  other: "linear-gradient(180deg, #d4d4d8 0%, #f4f4f5 100%)",
};

export function getWorkCategoryIcon(category: string): LucideIcon {
  return WORK_CATEGORY_ICONS[category] ?? Shapes;
}
