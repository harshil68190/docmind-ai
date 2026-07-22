import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { downloadDocument } from "@/api/documents.api";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { UploadDropzone } from "@/components/documents/UploadDropzone";
import { Button } from "@/components/ui/button";
import { useDeleteDocument, useDocuments, useUploadDocument } from "@/hooks/useDocuments";
import { getApiErrorMessage } from "@/lib/errors";

export function DocumentsPage() {
  const { data: documents = [], isLoading } = useDocuments();
  const upload = useUploadDocument();
  const deleteMutation = useDeleteDocument();
  const [error, setError] = useState<string | null>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);

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

  function scrollToDropzone() {
    dropzoneRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-fade-in px-2">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Your Documents</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your organization's documents and explore them using AI-powered semantic search.
          </p>
        </div>
        <Button onClick={scrollToDropzone} className="gap-2 rounded-xl px-5 font-medium shadow-sm hover:shadow-md transition-all">
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Upload Dropzone Container */}
      <div ref={dropzoneRef} className="scroll-mt-6 pt-2">
        <UploadDropzone
          onFileSelected={handleFileSelected}
          disabled={upload.isPending}
          progress={upload.isPending ? upload.progress : null}
        />
      </div>

      {error && (
        <div role="alert" className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-xs font-medium text-destructive">
          {error}
        </div>
      )}

      {/* Content Section */}
      {isLoading ? (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-xl border border-border bg-card/60 p-5 animate-pulse" />
          ))}
        </div>
      ) : (
        <DocumentTable
          documents={documents}
          onDelete={handleDelete}
          onDownload={handleDownload}
          deletingId={deleteMutation.isPending ? (deleteMutation.variables ?? null) : null}
          onUploadTrigger={scrollToDropzone}
        />
      )}
    </div>
  );
}

