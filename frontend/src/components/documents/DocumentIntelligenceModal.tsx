import { X, FileText, Bot, Download, Trash2, Sparkles, Calendar, HardDrive, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/documents/StatusBadge";
import type { DocumentDto } from "@/types/document";

interface DocumentIntelligenceModalProps {
  document: DocumentDto | null;
  onClose: () => void;
  onDownload: (id: string, filename: string) => void;
  onDelete: (id: string) => void;
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

const PLANNED_CAPABILITIES = [
  { name: "Executive Summary", desc: "Automated high-level summary distilled for leadership." },
  { name: "Key Insights", desc: "Extracted core conclusions, bullet points, and operational findings." },
  { name: "FAQs", desc: "Generated Q&A list addressing common document questions." },
  { name: "Entity Extraction", desc: "Structured detection of companies, dates, people, and legal terms." },
  { name: "Timeline Analysis", desc: "Sequential chronological mapping of key milestones and events." },
];

export function DocumentIntelligenceModal({
  document,
  onClose,
  onDownload,
  onDelete,
}: DocumentIntelligenceModalProps) {
  const navigate = useNavigate();

  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fade-in select-none">
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground max-w-md truncate">
                  {document.original_filename}
                </h2>
                <StatusBadge status={document.status} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Document Intelligence Asset</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="mt-6 space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Metadata Grid */}
          <div className="grid grid-cols-3 gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 text-xs">
            <div className="flex items-center gap-2.5">
              <HardDrive className="h-4 w-4 text-muted-foreground/80" />
              <div>
                <p className="text-muted-foreground">File Size</p>
                <p className="font-semibold text-foreground">{formatFileSize(document.file_size)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-muted-foreground/80" />
              <div>
                <p className="text-muted-foreground">Upload Date</p>
                <p className="font-semibold text-foreground">{formatDate(document.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Layers className="h-4 w-4 text-muted-foreground/80" />
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-semibold text-foreground">{document.status}</p>
              </div>
            </div>
          </div>

          {/* Primary Action Row */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              className="flex-1 gap-2 font-medium"
              onClick={() => {
                onClose();
                navigate("/chat");
              }}
              disabled={document.status !== "READY"}
            >
              <Bot className="h-4 w-4" />
              Ask AI About This Document
            </Button>
            <Button
              variant="outline"
              size="default"
              className="gap-2"
              onClick={() => onDownload(document.id, document.original_filename)}
              disabled={document.status !== "READY"}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="default"
              className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                onDelete(document.id);
                onClose();
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete Asset
            </Button>
          </div>

          {/* Enterprise Intelligence Section */}
          <div className="rounded-xl border border-border/80 bg-slate-50/50 p-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Enterprise Intelligence</h3>
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-200/70 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
                Planned
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PLANNED_CAPABILITIES.map((cap) => (
                <div
                  key={cap.name}
                  className="rounded-lg border border-border/50 bg-card p-3 shadow-2xs opacity-85"
                >
                  <p className="text-xs font-semibold text-foreground">{cap.name}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">{cap.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
