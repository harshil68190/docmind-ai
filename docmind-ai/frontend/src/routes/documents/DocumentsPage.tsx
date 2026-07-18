import { FileText } from "lucide-react";

export function DocumentsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload and processing pipeline is wired up in Milestone 3.
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 text-center">
        <FileText className="h-10 w-10 text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">No documents yet</p>
      </div>
    </div>
  );
}
