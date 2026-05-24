export const AI_SETTING_KEYS = [
  "ai_provider",
  "openai_api_key",
  "openai_model",
  "google_ai_api_key",
  "gemini_model",
] as const;

export type AiSettingKey = (typeof AI_SETTING_KEYS)[number];
