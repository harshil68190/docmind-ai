import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { deleteDocument, fetchDocuments, uploadDocument } from "@/api/documents.api";
import type { DocumentDto } from "@/types/document";

const DOCUMENTS_QUERY_KEY = ["documents"] as const;

export function useDocuments() {
  return useQuery({
    queryKey: DOCUMENTS_QUERY_KEY,
    queryFn: fetchDocuments,
    // Extraction happens synchronously in Milestone 3 (no background job
    // queue yet), so in practice a document rarely stays in
    // UPLOADING/PROCESSING long enough to matter — but polling here is
    // what makes the status badge update on its own once Milestone 8+
    // moves extraction to a background worker, with zero UI changes needed.
    refetchInterval: (query) => {
      const documents = query.state.data as DocumentDto[] | undefined;
      const hasPending = documents?.some(
        (doc) => doc.status === "UPLOADING" || doc.status === "PROCESSING"
      );
      return hasPending ? 2000 : false;
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: (file: File) => uploadDocument(file, setProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
    },
    onSettled: () => setProgress(null),
  });

  return { ...mutation, progress };
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => deleteDocument(documentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY }),
  });
}
