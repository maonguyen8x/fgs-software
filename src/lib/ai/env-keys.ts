/** Supported .env variable names per AI provider (first non-empty wins). */
export const AI_ENV_KEY_ALIASES = {
  openai: ["OPENAI_API_KEY"],
  gemini: ["GOOGLE_AI_API_KEY", "GEMINI_API_KEY", "GOOGLE_API_KEY"],
  anthropic: ["ANTHROPIC_API_KEY"],
} as const;

function normalizeEnvValue(raw: string): string {
  let v = raw.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }
  return v;
}

export function readEnvApiKey(provider: keyof typeof AI_ENV_KEY_ALIASES): string | null {
  for (const key of AI_ENV_KEY_ALIASES[provider]) {
    const raw = process.env[key];
    if (!raw) continue;
    const value = normalizeEnvValue(raw);
    if (value) return value;
  }
  return null;
}

export function readEnvModel(
  keys: readonly string[],
  fallback: string
): string {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return fallback;
}
