import { useEffect, useRef, useState } from "react";
import {
  BrainCircuit,
  FileText,
  CalendarClock,
  ShieldAlert,
  HelpCircle,
  Layers,
  GitCompare,
  Sparkles,
  ShieldCheck,
  Search,
  type LucideIcon,
} from "lucide-react";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { useChat } from "@/hooks/useChat";

interface PromptSuggestion {
  text: string;
  icon: LucideIcon;
  desc: string;
  planned?: boolean;
}

const ENTERPRISE_PROMPTS: PromptSuggestion[] = [
  { text: "Summarize this document", icon: FileText, desc: "Synthesize key objectives, structure, and executive takeaways." },
  { text: "Extract important deadlines", icon: CalendarClock, desc: "Identify operational milestones, deliverable dates, and schedules." },
  { text: "Identify compliance requirements", icon: ShieldAlert, desc: "Detect legal policies, regulatory terms, and obligation rules." },
  { text: "Explain this section in simple language", icon: HelpCircle, desc: "Translate complex legal or technical jargon into clear summaries." },
  { text: "Find potential risks", icon: Layers, desc: "Uncover contractual liabilities, ambiguity, and financial risks." },
  { text: "Compare two documents", icon: GitCompare, desc: "Cross-analyze clause differences and document variations.", planned: true },
];

export function ChatPage() {
  const { messages, isStreaming, sendMessage, stopStreaming } = useChat();
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handlePromptClick(promptText: string, planned?: boolean) {
    if (planned) return;
    setSelectedPrompt(promptText);
    sendMessage(promptText);
  }

  return (
    <div className="flex h-[calc(100vh-4.5rem)] flex-col bg-slate-100/40 select-none animate-fade-in">
      {/* Scrollable Conversation Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        {messages.length === 0 ? (
          <div className="mx-auto flex min-h-[calc(100vh-18rem)] max-w-4xl flex-col items-center justify-center text-center py-2">
            {/* Enlarged Brand Icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-4 ring-primary/10">
              <BrainCircuit className="h-8 w-8" />
            </div>

            {/* Heading */}
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              What would you like to know?
            </h2>

            {/* Compact Trust Badges */}
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-3 py-1 text-[13px] font-medium text-slate-700 shadow-2xs">
                <Search className="h-3.5 w-3.5 text-primary" />
                Semantic Search
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-3 py-1 text-[13px] font-medium text-slate-700 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                Citation-backed Answers
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card px-3 py-1 text-[13px] font-medium text-slate-700 shadow-2xs">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Enterprise AI
              </span>
            </div>
            
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Search, analyze, and understand your enterprise documents using AI-powered
              semantic search with citation-backed answers.
            </p>

            {/* AI Capability Cards Grid */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full max-w-5xl text-left">
              {ENTERPRISE_PROMPTS.map((prompt) => {
                const Icon = prompt.icon;
                return (
                  <button
                    key={prompt.text}
                    onClick={() => handlePromptClick(prompt.text, prompt.planned)}
                    disabled={prompt.planned}
                    className={`group relative flex flex-col justify-between rounded-xl border p-5 transition-all duration-200 ${
                      prompt.planned
                        ? "border-border/50 bg-card/50 opacity-65 cursor-not-allowed"
                        : "border-border/80 bg-card hover:border-primary/40 hover:-translate-y-1 hover:shadow-lg hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 cursor-pointer"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Icon className="h-5 w-5" />
                        </div>
                        {prompt.planned && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            Planned
                          </span>
                        )}
                      </div>
                      <p className="mt-3 text-[13px] font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                        {prompt.text}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground/90 leading-relaxed">
                        {prompt.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6 py-2 animate-fade-in">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Floating Bottom Input Area */}
      <div className="mx-auto w-full max-w-5xl">
        <ChatInput
          onSend={(q) => {
            setSelectedPrompt("");
            sendMessage(q);
          }}
          onStop={stopStreaming}
          disabled={isStreaming}
          prefillValue={selectedPrompt}
        />
      </div>
    </div>
  );
}


