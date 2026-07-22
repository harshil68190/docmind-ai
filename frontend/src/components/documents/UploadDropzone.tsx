import { useRef, useState, type DragEvent } from "react";
import { UploadCloud, FileText } from "lucide-react";
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
        "group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-7 px-6 text-center transition-all duration-200 cursor-pointer select-none",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.005]"
          : "border-border/80 bg-card hover:border-primary/50 hover:shadow-md",
        disabled && "pointer-events-none opacity-60"
      )}
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-200 group-hover:scale-110 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-200 group-hover:scale-110">
        <UploadCloud className="h-7 w-7" />
      </div>

      <div className="mt-3">
        <p className="text-sm font-semibold text-foreground">
          {progress != null ? (
            <span className="text-primary font-bold">Uploading and processing your document...{progress}%</span>
          ) : (
            <>
                <span className="block">
                    Drag & drop your documents here
                </span>

                <span className="mt-1 block text-primary font-medium underline underline-offset-2">
                    Browse from your computer
                </span>
            </>
          )}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Supports PDF, DOCX, PPTX and TXT files • Maximum size 20 MB
        </p>
      </div>

      {progress != null && (
        <div className="mt-4 h-2 w-64 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-primary transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Format Chips */}
      {progress == null && (
        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
          {["PDF", "DOCX", "PPTX", "TXT"].map((ext) => (
            <span
              key={ext}
              className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground"
            >
              <FileText className="h-2.5 w-2.5" />
              {ext}
            </span>
          ))}
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

