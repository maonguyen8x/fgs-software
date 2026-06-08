import { getSettingsMap } from "./settings";

const FALLBACK_SETTINGS: Record<string, string> = {
  company_name: "FGS Software",
  chatbot_enabled: "true",
  chatbot_name: "Nova",
  chatbot_position: "right",
  hero_typewriter_enabled: "true",
  page_header_about_bg: "#e0f2fe",
  page_header_services_bg: "#dcfce7",
  page_header_team_bg: "#ecfeff",
  page_header_works_bg: "#eef2ff",
  page_header_contact_bg: "#fef3c7",
};

export async function getSettingsMapSafe(): Promise<Record<string, string>> {
  try {
    return await getSettingsMap();
  } catch {
    return { ...FALLBACK_SETTINGS };
  }
}
