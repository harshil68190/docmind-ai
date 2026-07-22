import { useNavigate } from "react-router-dom";
import { Upload, Bot, FileText, Sparkles, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocuments } from "@/hooks/useDocuments";
import { StatusBadge } from "@/components/documents/StatusBadge";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: documents = [], isLoading } = useDocuments();

  const recentDocs = documents.slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl space-y-10 animate-fade-in select-none">
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-blue-50/40 p-8 sm:p-10 shadow-xs">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-blue-700">
            <Sparkles className="h-3.5 w-3.5" />
            Enterprise Knowledge Platform
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Welcome back!
          </h1>
          <p className="mt-2 text-base text-muted-foreground leading-relaxed">
            Upload documents, search company knowledge, and ask AI-powered questions.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="gap-2 font-medium shadow-sm"
              onClick={() => navigate("/documents")}
            >
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 font-medium bg-card hover:bg-muted"
              onClick={() => navigate("/chat")}
            >
              <Bot className="h-4 w-4 text-primary" />
              Open AI Assistant
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/documents")}
            className="group flex items-center justify-between rounded-xl border border-border/80 bg-card p-5 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Upload PDF</p>
                <p className="text-xs text-muted-foreground">Add to knowledge base</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </button>

          <button
            onClick={() => navigate("/chat")}
            className="group flex items-center justify-between rounded-xl border border-border/80 bg-card p-5 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Ask AI</p>
                <p className="text-xs text-muted-foreground">Query uploaded documents</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
          </button>

          <button
            onClick={() => navigate("/documents")}
            className="group flex items-center justify-between rounded-xl border border-border/80 bg-card p-5 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-xs"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600 ring-1 ring-purple-100 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Browse Documents</p>
                <p className="text-xs text-muted-foreground">Explore knowledge assets</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-purple-600" />
          </button>
        </div>
      </div>

      {/* Recent Documents Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Recent Documents
          </h2>
          {documents.length > 0 && (
            <button
              onClick={() => navigate("/documents")}
              className="text-xs font-semibold text-primary hover:underline"
            >
              View all ({documents.length}) →
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-xl border border-border bg-card/60 p-4 animate-pulse" />
            ))}
          </div>
        ) : recentDocs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-card/50 p-10 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground/60" />
            <p className="mt-3 text-sm font-semibold text-foreground">No documents uploaded yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload your first PDF to build your enterprise knowledge base.
            </p>
            <Button
              size="sm"
              className="mt-4 gap-2 font-medium"
              onClick={() => navigate("/documents")}
            >
              <Upload className="h-3.5 w-3.5" />
              Upload PDF
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => navigate("/documents")}
                className="group cursor-pointer rounded-xl border border-border/80 bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <FileText className="h-4 w-4" />
                  </div>
                  <StatusBadge status={doc.status} />
                </div>
                <h3 className="mt-3 truncate text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  {doc.original_filename}
                </h3>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Uploaded {formatDate(doc.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Conversations Section */}
      <div className="space-y-4 pt-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Recent Conversations
        </h2>
        <div className="rounded-xl border border-border/80 bg-card p-8 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-semibold text-foreground">No active conversation history</p>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
            Start a new session with the AI Assistant to query your uploaded knowledge base documents.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 gap-2 font-medium"
            onClick={() => navigate("/chat")}
          >
            <Bot className="h-3.5 w-3.5 text-primary" />
            Start AI Chat
          </Button>
        </div>
      </div>
    </div>
  );
}

