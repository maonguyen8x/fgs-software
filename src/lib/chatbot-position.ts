export const CHATBOT_POSITIONS = ["right", "left", "top", "bottom"] as const;

export type ChatbotPosition = (typeof CHATBOT_POSITIONS)[number];

export const DEFAULT_CHATBOT_POSITION: ChatbotPosition = "right";

export function parseChatbotPosition(value: string | undefined | null): ChatbotPosition {
  const normalized = value?.trim().toLowerCase();
  if (normalized && CHATBOT_POSITIONS.includes(normalized as ChatbotPosition)) {
    return normalized as ChatbotPosition;
  }
  return DEFAULT_CHATBOT_POSITION;
}
