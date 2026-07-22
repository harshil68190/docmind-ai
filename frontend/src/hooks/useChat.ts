import { useCallback, useRef, useState } from "react";
import { streamChatMessage } from "@/api/chat.api";
import type { ChatMessage } from "@/types/chat";

function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Owns the entire conversation for one chat session, in memory only —
 * per the milestone spec, history persists until page refresh and no
 * further. Each `sendMessage` call appends a user message and a
 * placeholder assistant message immediately, then patches that same
 * assistant message in place as tokens/citations arrive.
 */
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const updateMessage = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((message) => (message.id === id ? { ...message, ...patch } : message)));
  }, []);

  const appendToken = useCallback((id: string, token: string) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === id ? { ...message, content: message.content + token } : message
      )
    );
  }, []);

  const sendMessage = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || isStreaming) return;

      const userMessage: ChatMessage = { id: createMessageId(), role: "user", content: trimmed };
      const assistantId = createMessageId();
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        await streamChatMessage(
          trimmed,
          {
            onToken: (content) => appendToken(assistantId, content),
            onCitations: (citations) => updateMessage(assistantId, { citations }),
            onError: (message) => updateMessage(assistantId, { error: message, isStreaming: false }),
          },
          controller.signal
        );
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          updateMessage(assistantId, {
            error: "Something went wrong. Please try again.",
            isStreaming: false,
          });
        }
      } finally {
        updateMessage(assistantId, { isStreaming: false });
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [isStreaming, appendToken, updateMessage]
  );

  const stopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return { messages, isStreaming, sendMessage, stopStreaming };
}
