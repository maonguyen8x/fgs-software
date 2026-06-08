export interface ChatHistoryMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date | string;
}

function messageKey(message: ChatHistoryMessage): string {
  return `${message.role}:${message.content.trim()}`;
}

/** Collapse consecutive duplicates (keeps order). */
export function dedupeConsecutiveChatMessages<T extends ChatHistoryMessage>(messages: T[]): T[] {
  const result: T[] = [];
  for (const message of messages) {
    const prev = result[result.length - 1];
    if (prev && messageKey(prev) === messageKey(message)) continue;
    result.push(message);
  }
  return result;
}

/** Remove repeated role+content pairs anywhere in the thread (keeps first occurrence). */
export function dedupeChatHistory<T extends ChatHistoryMessage>(messages: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const message of messages) {
    const key = messageKey(message);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(message);
  }
  return result;
}
