import { useRef, useState, type DragEvent } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".pptx", ".txt"];

interface UploadDropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  progress?: number | null;
}

export function UploadDropzone({ onFileSelected, disabled, progress }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) onFileSelected(file);
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-border",
        disabled && "pointer-events-none opacity-60"
      )}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <UploadCloud className="h-8 w-8 text-muted-foreground" />

      <p className="mt-3 text-sm font-medium">
        {progress != null ? `Uploading… ${progress}%` : "Drag and drop a file, or"}
      </p>

      {progress == null && (
        <button
          type="button"
          className="mt-1 text-sm font-medium text-primary hover:underline"
          onClick={() => inputRef.current?.click()}
        >
          browse to upload
        </button>
      )}

      <p className="mt-2 text-xs text-muted-foreground">PDF, DOCX, PPTX, or TXT — up to 20MB</p>

      {progress != null && (
        <div className="mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS.join(",")}
        className="hidden"
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFileSelected(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}
