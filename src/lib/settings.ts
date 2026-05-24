import { getCachedSettings } from "./cache/queries";

export async function getSettingsMap(): Promise<Record<string, string>> {
  return getCachedSettings();
}
