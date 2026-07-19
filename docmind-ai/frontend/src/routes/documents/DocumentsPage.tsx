import { useState } from "react";
import { downloadDocument } from "@/api/documents.api";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { UploadDropzone } from "@/components/documents/UploadDropzone";
import { useDeleteDocument, useDocuments, useUploadDocument } from "@/hooks/useDocuments";
import { getApiErrorMessage } from "@/lib/errors";

export function DocumentsPage() {
  const { data: documents = [], isLoading } = useDocuments();
  const upload = useUploadDocument();
  const deleteMutation = useDeleteDocument();
  const [error, setError] = useState<string | null>(null);

  function handleFileSelected(file: File) {
    setError(null);
    upload.mutate(file, {
      onError: (err) => setError(getApiErrorMessage(err, "Upload failed. Please try again.")),
    });
  }

  async function handleDownload(id: string, filename: string) {
    try {
      await downloadDocument(id, filename);
    } catch (err) {
      setError(getApiErrorMessage(err, "Download failed. Please try again."));
    }
  }

  function handleDelete(id: string) {
    setError(null);
    deleteMutation.mutate(id, {
      onError: (err) => setError(getApiErrorMessage(err, "Delete failed. Please try again.")),
    });
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload PDF, DOCX, PPTX, or TXT files up to 20MB.
        </p>
      </div>

      <div className="mt-6">
        <UploadDropzone
          onFileSelected={handleFileSelected}
          disabled={upload.isPending}
          progress={upload.isPending ? upload.progress : null}
        />
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="mt-6 text-sm text-muted-foreground">Loading documents…</p>
      ) : (
        <DocumentTable
          documents={documents}
          onDelete={handleDelete}
          onDownload={handleDownload}
          deletingId={deleteMutation.isPending ? (deleteMutation.variables ?? null) : null}
        />
      )}
    </div>
  );
}
