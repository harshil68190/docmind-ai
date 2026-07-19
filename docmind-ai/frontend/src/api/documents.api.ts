import { apiClient } from "@/api/client";
import type { DocumentDto } from "@/types/document";

export async function fetchDocuments(): Promise<DocumentDto[]> {
  const { data } = await apiClient.get<DocumentDto[]>("/documents");
  return data;
}

export async function uploadDocument(
  file: File,
  onProgress?: (percent: number) => void
): Promise<DocumentDto> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await apiClient.post<DocumentDto>("/documents/upload", formData, {
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  return data;
}

export async function deleteDocument(documentId: string): Promise<void> {
  await apiClient.delete(`/documents/${documentId}`);
}

/**
 * Downloads happen via a blob fetch rather than a plain `<a href>` because
 * the download endpoint is authenticated — a bare anchor tag has no way to
 * attach an Authorization header, but `apiClient` (with its auth
 * interceptor) does.
 */
export async function downloadDocument(documentId: string, filename: string): Promise<void> {
  const response = await apiClient.get(`/documents/${documentId}/download`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = window.document.createElement("a");
  link.href = url;
  link.download = filename;
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
