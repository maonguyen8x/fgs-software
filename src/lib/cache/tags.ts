export const CACHE_TAGS = {
  settings: "settings",
  services: "services",
  team: "team",
  works: "works",
  stats: "stats",
  about: "about",
  founders: "founders",
  timeline: "timeline",
  coreValues: "core-values",
  branches: "branches",
  whyChooseUs: "why-choose-us",
  testimonials: "testimonials",
  techStack: "tech-stack",
  blog: "blog",
  partners: "partners",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
