import { FileText } from "lucide-react";
import type { ChatCitation } from "@/types/chat";

export function CitationList({ citations }: { citations: ChatCitation[] }) {
  if (citations.length === 0) return null;

  return (
    <div className="mt-3 border-t border-border pt-2">
      <p className="mb-1 text-xs font-medium text-muted-foreground">Sources</p>
      <ul className="space-y-1">
        {citations.map((citation, index) => (
          <li
            key={`${citation.file}-${citation.page}-${index}`}
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <FileText className="h-3 w-3 shrink-0" />
            <span>
              {citation.file}
              {citation.page != null ? ` (Page ${citation.page})` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
