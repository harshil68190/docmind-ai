import { useRef, useState, useEffect, type KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (question: string) => void;
  onStop: () => void;
  disabled: boolean;
  prefillValue?: string;
}

export function ChatInput({ onSend, onStop, disabled, prefillValue }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (prefillValue) {
      setValue(prefillValue);
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
      }
    }
  }, [prefillValue]);

  function handleSend() {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  function handleInput() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }

  return (
    <div className="px-4 pb-4 pt-3 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent select-none">
      <div className="relative flex items-end rounded-2xl border border-border/90 bg-card p-3 shadow-xl shadow-slate-900/8 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your knowledge base..."
          rows={1}
          className="max-h-40 flex-1 resize-none bg-transparent px-4 py-2 text-sm sm:text-base text-sm sm:text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
        />
        {disabled ? (
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl border-border bg-muted hover:bg-muted/80"
            onClick={onStop}
            aria-label="Stop generating"
          >
            <Square className="h-3.5 w-3.5 fill-current text-foreground" />
          </Button>
        ) : (
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!value.trim()}
            className="h-10 w-10 shrink-0 rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25 hover:bg-primary/95 hover:scale-[1.02] active:scale-95 disabled:opacity-35 transition-all duration-150"
            aria-label="Send message"
          >
            <ArrowUp className="h-4.5 w-4.5 stroke-[2.5]" />
          </Button>
        )}
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground/75 leading-none">
        AI responses are grounded in your documents with citation-backed answers.
      </p>
    </div>
  );
}