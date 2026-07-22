import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BrainCircuit, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { CitationList } from "@/components/chat/CitationList";
import { markdownComponents } from "@/components/chat/markdownComponents";
import type { ChatMessage } from "@/types/chat";

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground py-1">
      <Sparkles className="h-3.5 w-3.5 animate-pulse text-primary" />
      <span>AI thinking…</span>
      <span className="inline-flex items-center gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60" />
      </span>
    </div>
  );
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const showTypingIndicator = !isUser && message.isStreaming && message.content.length === 0;

  return (
    <div className={cn("flex gap-3 animate-fade-in", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
          <BrainCircuit className="h-4 w-4" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-5 py-3.5 text-sm sm:max-w-[78%] leading-relaxed shadow-2xs",
          isUser
            ? "bg-slate-900 text-slate-50 font-medium rounded-tr-xs"
            : "border border-border/80 bg-card text-foreground rounded-tl-xs"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : showTypingIndicator ? (
          <TypingIndicator />
        ) : (
          <>
            <div className="[&_>*:last-child]:mb-0 font-normal">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {message.content}
              </ReactMarkdown>
            </div>
            {message.error && (
              <p role="alert" className="mt-2 text-xs font-medium text-destructive">
                {message.error}
              </p>
            )}
            {message.citations && <CitationList citations={message.citations} />}
          </>
        )}
      </div>
    </div>
  );
}

