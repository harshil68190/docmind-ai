import { useAuthStore } from "@/stores/authStore";
import type { ChatCitation } from "@/types/chat";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

interface ChatResponse {
  answer: string;
  citations: ChatCitation[];
}

interface StreamChatCallbacks {
  onToken: (content: string) => void;
  onCitations: (citations: ChatCitation[]) => void;
  onError: (message: string) => void;
}

export async function streamChatMessage(
  question: string,
  callbacks: StreamChatCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const token = useAuthStore.getState().accessToken;

  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ question }),
    signal,
  });

  if (response.status === 401) {
    useAuthStore.getState().clearSession();
    callbacks.onError("Your session has expired. Please sign in again.");
    return;
  }

  if (!response.ok) {
    const text = await response.text();
    callbacks.onError(text);
    return;
  }

  const data: ChatResponse = await response.json();

  // Simulate a streamed response by sending the full answer at once
  callbacks.onToken(data.answer);
  callbacks.onCitations(data.citations);
}