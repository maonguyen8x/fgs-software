/** Supported .env variable names per AI provider (first non-empty wins). */
export const AI_ENV_KEY_ALIASES = {
  openai: ["OPENAI_API_KEY"],
  gemini: ["GOOGLE_AI_API_KEY", "GEMINI_API_KEY", "GOOGLE_API_KEY"],
  anthropic: ["ANTHROPIC_API_KEY"],
} as const;

export function readEnvApiKey(provider: keyof typeof AI_ENV_KEY_ALIASES): string | null {
  for (const key of AI_ENV_KEY_ALIASES[provider]) {
    const value = process.env[key]?.trim();
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
