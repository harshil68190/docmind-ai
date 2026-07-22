import { FileText, CheckCircle2 } from "lucide-react";
import type { ChatCitation } from "@/types/chat";

export function CitationList({ citations }: { citations: ChatCitation[] }) {
  if (citations.length === 0) return null;

  return (
    <div className="mt-4 border-t border-border/60 pt-3">
      <div className="flex items-center gap-1.5 mb-2.5">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Source Citations ({citations.length})
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {citations.map((citation, index) => (
          <div
            key={`${citation.file}-${citation.page}-${index}`}
            className="group flex items-center gap-2 rounded-lg border border-border/80 bg-muted/40 px-3 py-2 text-xs transition-all duration-150 hover:border-primary/40 hover:bg-card shadow-2xs select-none"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-blue-50 text-blue-600 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <FileText className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate max-w-[160px] leading-tight">
                {citation.file}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-muted-foreground">
                {citation.page != null && (
                  <span className="rounded bg-background px-1.5 py-0.2 border border-border/60 font-medium">
                    Page {citation.page}
                  </span>
                )}
                <span className="inline-flex items-center gap-0.5 text-emerald-600 font-medium">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  High Confidence
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

