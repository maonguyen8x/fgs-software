import { getLocalizedField } from "@/lib/i18n-content";
import type { Locale } from "@/i18n/routing";
import { getCachedChatKnowledge } from "@/lib/cache/queries";

export async function buildCompanyKnowledge(locale: Locale): Promise<string> {
  const {
    services,
    works,
    whyItems,
    stats,
    settings: settingsRows,
    aboutSections,
    founders,
    timeline,
    coreValues,
    branches,
  } = await getCachedChatKnowledge();

  const settings = settingsRows.reduce<Record<string, string>>((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});

  const companyName = settings.company_name ?? "FGS Software";
  const lines: string[] = [
    `Company: ${companyName}`,
    `Tagline: ${getSettingValue(settings, "hero_subheadline", locale)}`,
    `Contact email: ${settings.admin_email ?? "contact.fgssoftware@gmail.com"}`,
    `Phone: ${settings.phone ?? "N/A"}`,
    `Address: ${settings.address ?? "Da Nang, Vietnam"}`,
    `Working hours: ${settings.working_hours ?? "Mon–Fri 9:00–18:00 ICT"}`,
    "",
    "=== SERVICES ===",
  ];

  for (const s of services) {
    lines.push(
      `- ${getLocalizedField(s, "title", locale)}: ${getLocalizedField(s, "description", locale)} | Tech: ${s.techStack.join(", ")}`
    );
  }

  lines.push("", "=== PRODUCTS / PORTFOLIO ===");
  for (const w of works) {
    lines.push(
      `- ${getLocalizedField(w, "title", locale)} (${w.category}): ${getLocalizedField(w, "summary", locale)}`
    );
  }

  if (aboutSections.length > 0) {
    lines.push("", "=== ABOUT / MISSION / VISION ===");
    for (const section of aboutSections) {
      const title = getLocalizedField(section, "title", locale) || section.section;
      const content = getLocalizedField(section, "content", locale);
      if (content) lines.push(`${title}: ${content.slice(0, 400)}`);
    }
  }

  if (timeline.length > 0) {
    lines.push("", "=== COMPANY TIMELINE ===");
    for (const m of timeline) {
      lines.push(
        `- ${m.milestoneDate}: ${getLocalizedField(m, "title", locale)} — ${getLocalizedField(m, "description", locale)}`
      );
    }
  }

  if (coreValues.length > 0) {
    lines.push("", "=== CORE VALUES ===");
    for (const v of coreValues) {
      lines.push(`- ${getLocalizedField(v, "title", locale)}: ${getLocalizedField(v, "description", locale)}`);
    }
  }

  if (founders.length > 0) {
    lines.push("", "=== FOUNDING TEAM ===");
    for (const f of founders) {
      lines.push(
        `- ${f.name}, ${getLocalizedField(f, "role", locale)}${getLocalizedField(f, "slogan", locale) ? ` — "${getLocalizedField(f, "slogan", locale)}"` : ""}`
      );
    }
  }

  if (branches.length > 0) {
    lines.push("", "=== OFFICES ===");
    for (const b of branches) {
      lines.push(
        `- ${getLocalizedField(b, "name", locale) || b.name} (${getLocalizedField(b, "city", locale) || b.city}): ${getLocalizedField(b, "address", locale) || b.address}`
      );
    }
  }

  lines.push("", "=== WHY CHOOSE US ===");
  for (const w of whyItems) {
    lines.push(`- ${getLocalizedField(w, "title", locale)}: ${getLocalizedField(w, "description", locale)}`);
  }

  if (stats.length > 0) {
    lines.push("", "=== STATS ===");
    for (const st of stats) {
      lines.push(`- ${getLocalizedField(st, "label", locale)}: ${st.value}${st.suffix ?? ""}`);
    }
  }

  return lines.join("\n");
}

function getSettingValue(settings: Record<string, string>, key: string, locale: Locale): string {
  if (locale === "ja") {
    const ja = settings[`${key}_ja`];
    if (ja) return ja;
  }
  if (locale === "vi") {
    const vi = settings[`${key}_vi`];
    if (vi) return vi;
  }
  return settings[key] ?? "";
}
