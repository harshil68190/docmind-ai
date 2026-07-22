export interface ChatCitation {
  file: string;
  page: number | null;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  citations?: ChatCitation[];
  isStreaming?: boolean;
  error?: string;
}
