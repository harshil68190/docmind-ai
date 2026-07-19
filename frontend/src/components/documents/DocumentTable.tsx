import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/documents/StatusBadge";
import type { DocumentDto } from "@/types/document";

interface DocumentTableProps {
  documents: DocumentDto[];
  onDelete: (id: string) => void;
  onDownload: (id: string, filename: string) => void;
  deletingId?: string | null;
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

export function DocumentTable({ documents, onDelete, onDownload, deletingId }: DocumentTableProps) {
  if (documents.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        No documents yet — upload one above to get started.
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-secondary/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Size</th>
            <th className="px-4 py-3 font-medium">Uploaded</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td className="max-w-xs truncate px-4 py-3 font-medium">{doc.original_filename}</td>
              <td className="px-4 py-3">
                <StatusBadge status={doc.status} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">{formatFileSize(doc.file_size)}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatDate(doc.created_at)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Download ${doc.original_filename}`}
                    disabled={doc.status !== "READY"}
                    onClick={() => onDownload(doc.id, doc.original_filename)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Delete ${doc.original_filename}`}
                    disabled={deletingId === doc.id}
                    onClick={() => onDelete(doc.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
