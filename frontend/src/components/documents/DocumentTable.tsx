import { useState } from "react";
import { DocumentCard } from "@/components/documents/DocumentCard";
import { DocumentIntelligenceModal } from "@/components/documents/DocumentIntelligenceModal";
import { EmptyDocumentsState } from "@/components/documents/EmptyDocumentsState";
import type { DocumentDto } from "@/types/document";

interface DocumentTableProps {
  documents: DocumentDto[];
  onDelete: (id: string) => void;
  onDownload: (id: string, filename: string) => void;
  deletingId?: string | null;
  onUploadTrigger?: () => void;
}

export function DocumentTable({
  documents,
  onDelete,
  onDownload,
  deletingId,
  onUploadTrigger,
}: DocumentTableProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocumentDto | null>(null);

  if (documents.length === 0) {
    return (
      <div className="mt-8">
        <EmptyDocumentsState onUploadClick={() => onUploadTrigger?.()} />
      </div>
    );
  }

  return (
    <>
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Your Documents ({documents.length})
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onOpenIntelligence={(d) => setSelectedDoc(d)}
              onDownload={onDownload}
              onDelete={onDelete}
              isDeleting={deletingId === doc.id}
            />
          ))}
        </div>
      </div>

      <DocumentIntelligenceModal
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
        onDownload={onDownload}
        onDelete={onDelete}
      />
    </>
  );
}

