import { AlertTriangle } from "lucide-react";

export function DemoNotice() {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
      <div className="flex gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />

        <div>
          <h3 className="font-semibold text-amber-900">
            Demo Backend Offline
          </h3>

          <p className="mt-2 text-sm text-amber-800">
            The frontend is deployed successfully.
            The AI backend is currently offline because it relies on a local
            FastAPI + FAISS + SentenceTransformer pipeline.
          </p>

          <p className="mt-2 text-sm text-amber-800">
            Please refer to the GitHub repository or the demo video to see the
            complete workflow.
          </p>
        </div>
      </div>
    </div>
  );
}