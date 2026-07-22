import { FileUp, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyDocumentsStateProps {
  onUploadClick: () => void;
}

export function EmptyDocumentsState({ onUploadClick }: EmptyDocumentsStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/50 px-6 py-16 text-center select-none animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-8 ring-primary/5">
        <FileUp className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-base font-bold text-foreground">No documents uploaded yet</h3>
      <p className="mt-1.5 text-xs text-muted-foreground max-w-sm">
        Upload your first PDF or text document to build your enterprise knowledge base and unlock AI search.
      </p>
      <Button onClick={onUploadClick} size="sm" className="mt-6 gap-2 font-medium">
        <Upload className="h-4 w-4" />
        Upload Your First PDF
      </Button>
    </div>
  );
}
