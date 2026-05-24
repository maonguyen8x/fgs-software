import { getSettingsMap } from "./settings";

const FALLBACK_SETTINGS: Record<string, string> = {
  company_name: "FGS Software",
  chatbot_enabled: "true",
  chatbot_name: "Nova",
};

export async function getSettingsMapSafe(): Promise<Record<string, string>> {
  try {
    return await getSettingsMap();
  } catch {
    return { ...FALLBACK_SETTINGS };
  }
}
