export const AI_PROVIDER_TYPES = [
  { value: "openai", label: "OpenAI" },
  { value: "gemini", label: "Google Gemini" },
  { value: "anthropic", label: "Anthropic Claude" },
] as const;

export type AiProviderType = (typeof AI_PROVIDER_TYPES)[number]["value"];

export const AI_MODEL_PRESETS: Record<AiProviderType, { value: string; label: string }[]> = {
  openai: [
    { value: "gpt-4o-mini", label: "gpt-4o-mini" },
    { value: "gpt-4o", label: "gpt-4o" },
    { value: "gpt-4.1-mini", label: "gpt-4.1-mini" },
  ],
  gemini: [
    { value: "gemini-2.5-flash-lite", label: "gemini-2.5-flash-lite" },
    { value: "gemini-2.5-flash", label: "gemini-2.5-flash" },
  ],
  anthropic: [
    { value: "claude-3-5-haiku-20241022", label: "claude-3-5-haiku-20241022" },
    { value: "claude-sonnet-4-20250514", label: "claude-sonnet-4-20250514" },
  ],
};

export const AI_DEFAULT_MODELS: Record<AiProviderType, string> = {
  openai: "gpt-4o-mini",
  gemini: "gemini-2.5-flash-lite",
  anthropic: "claude-3-5-haiku-20241022",
};

export function getProviderLabel(type: string): string {
  return AI_PROVIDER_TYPES.find((p) => p.value === type)?.label ?? type;
}

export function isPresetModel(type: string, model: string): boolean {
  const presets = AI_MODEL_PRESETS[type as AiProviderType];
  return presets?.some((p) => p.value === model) ?? false;
}
