import fs from "fs/promises";
import path from "path";
import { logger } from "@/lib/logger";

const ENV_FILE = path.join(process.cwd(), ".env");

/** Keys allowed to be written from admin AI settings sync. */
export const AI_ENV_WRITE_KEYS = [
  "AI_PROVIDER",
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  "GOOGLE_AI_API_KEY",
  "GEMINI_API_KEY",
  "GEMINI_MODEL",
  "ANTHROPIC_API_KEY",
  "ANTHROPIC_MODEL",
] as const;

function escapeEnvValue(value: string): string {
  if (/[\s#"\\]/.test(value)) {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return value;
}

export async function upsertEnvFileVars(vars: Record<string, string>): Promise<string[]> {
  const updated: string[] = [];
  let content: string;
  try {
    content = await fs.readFile(ENV_FILE, "utf8");
  } catch {
    content = "";
  }

  for (const [key, rawValue] of Object.entries(vars)) {
    if (!AI_ENV_WRITE_KEYS.includes(key as (typeof AI_ENV_WRITE_KEYS)[number])) continue;
    const value = rawValue.trim();
    if (!value) continue;

    const line = `${key}=${escapeEnvValue(value)}`;
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(content)) {
      content = content.replace(regex, line);
    } else {
      const prefix = content.length > 0 && !content.endsWith("\n") ? "\n" : "";
      content += `${prefix}${line}\n`;
    }
    updated.push(key);
  }

  await fs.writeFile(ENV_FILE, content, "utf8");
  logger.info("Updated .env keys from admin sync", { keys: updated });
  return updated;
}
