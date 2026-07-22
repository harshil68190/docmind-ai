import { cn } from "@/lib/utils";
import type { DocumentStatus } from "@/types/document";

const STATUS_STYLES: Record<DocumentStatus, string> = {
  UPLOADING: "bg-blue-50 text-blue-700 border-blue-200",
  PROCESSING: "bg-amber-50 text-amber-700 border-amber-200",
  READY: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<DocumentStatus, string> = {
  UPLOADING: "Uploading",
  PROCESSING: "Processing",
  READY: "Ready",
  FAILED: "Failed",
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <span
        className={cn(
            "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
            STATUS_STYLES[status]
        )}
    >
        <span
            className={cn(
                "mr-1.5 h-2 w-2 rounded-full",
                status === "READY" && "bg-emerald-500",
                status === "PROCESSING" && "bg-amber-500",
                status === "FAILED" && "bg-red-500",
                status === "UPLOADING" && "bg-blue-500"
            )}
        />

        {STATUS_LABELS[status]}
    </span>
  );
}
