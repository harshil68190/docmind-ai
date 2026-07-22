import { FileText, Bot, Sparkles, Download, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/documents/StatusBadge";
import type { DocumentDto } from "@/types/document";

interface DocumentCardProps {
  document: DocumentDto;
  onOpenIntelligence: (doc: DocumentDto) => void;
  onDownload: (id: string, filename: string) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DocumentCard({
  document,
  onOpenIntelligence,
  onDownload,
  onDelete,
  isDeleting,
}: DocumentCardProps) {
  const navigate = useNavigate();

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100/80 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
              <FileText className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold font-semibold text-foreground group-hover:text-primary transition-colors">
                {document.original_filename}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDate(document.created_at)}</span>
                  <span>•</span>
                  <span>{formatFileSize(document.file_size)}</span>
              </div>
            </div>
          </div>
          <StatusBadge status={document.status} />
        </div>
      </div>

      {/* Asset Actions */}
      <div className="mt-6 pt-4 border-t border-slate-200/70 border-border/50 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="flex-1 h-9 text-xs font-medium gap-1.5 shadow-xs"
            disabled={document.status !== "READY"}
            onClick={() => navigate("/chat")}
          >
            <Bot className="h-3.5 w-3.5" />
            AI Assistant
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 text-xs font-medium gap-1.5 border-border/80 hover:bg-muted"
            onClick={() => onOpenIntelligence(document)}
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Document Intelligence
          </Button>
        </div>

        {/* Secondary File Controls */}
        <div className="flex items-center justify-end gap-1 pt-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
            title="Download document"
            disabled={document.status !== "READY"}
            onClick={() => onDownload(document.id, document.original_filename)}
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
            title="Delete document asset"
            disabled={isDeleting}
            onClick={() => onDelete(document.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
