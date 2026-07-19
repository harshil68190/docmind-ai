export type DocumentStatus = "UPLOADING" | "PROCESSING" | "READY" | "FAILED";

export interface DocumentDto {
  id: string;
  original_filename: string;
  file_extension: string;
  mime_type: string;
  file_size: number;
  status: DocumentStatus;
  text_length: number | null;
  created_at: string;
  updated_at: string;
}
