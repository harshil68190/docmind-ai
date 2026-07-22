import { useEffect, useRef } from "react";
import { MessagesSquare } from "lucide-react";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { useChat } from "@/hooks/useChat";

export function ChatPage() {
  const { messages, isStreaming, sendMessage, stopStreaming } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <MessagesSquare className="h-10 w-10" />
            <div>
              <p className="text-sm font-medium text-foreground">Ask a question about your documents</p>
              <p className="mt-1 text-sm">Answers include citations back to the source file and page.</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6 sm:px-6">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="mx-auto w-full max-w-3xl">
        <ChatInput onSend={sendMessage} onStop={stopStreaming} disabled={isStreaming} />
      </div>
    </div>
  );
}
