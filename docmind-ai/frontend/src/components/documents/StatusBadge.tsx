import { cn } from "@/lib/utils";
import type { DocumentStatus } from "@/types/document";

const STATUS_STYLES: Record<DocumentStatus, string> = {
  UPLOADING: "bg-blue-50 text-blue-700 border-blue-200",
  PROCESSING: "bg-amber-50 text-amber-700 border-amber-200",
  READY: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status]
      )}
    >
      {status}
    </span>
  );
}
