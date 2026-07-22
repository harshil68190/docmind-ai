import { useState } from "react";
import { Building2, Users, Bot, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const TABS = [
  { id: "general", label: "General", icon: Building2 },
  { id: "members", label: "Members & Access", icon: Users },
  { id: "ai", label: "AI Models & Security", icon: Bot },
  { id: "compliance", label: "Compliance & Audit", icon: ShieldCheck },
] as const;

export function WorkspacePage() {
  const [activeTab, setActiveTab] = useState<string>("general");

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Workspace Settings</h1>
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            <Sparkles className="h-3 w-3" />
            Enterprise UI
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your organization&apos;s workspace configuration, security controls, and document access policies.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-6" aria-label="Tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-base font-semibold text-foreground">Organization Details</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              General settings for your enterprise knowledge workspace.
            </p>
            <div className="mt-6 space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  readOnly
                  value="Enterprise Knowledge Hub"
                  className="w-full rounded-md border border-input bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Organization Domain
                </label>
                <input
                  type="text"
                  readOnly
                  value="org.internal"
                  className="w-full rounded-md border border-input bg-muted/40 px-3.5 py-2 text-sm text-foreground focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "members" && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">Workspace Members</h3>
              <p className="mt-1 text-sm text-muted-foreground">Manage user access permissions and team roles.</p>
            </div>
            <Button size="sm" disabled>
              Invite Member (Planned)
            </Button>
          </div>
          <div className="mt-6 rounded-lg border border-border divide-y divide-border text-sm">
            <div className="flex items-center justify-between p-4 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                  AD
                </div>
                <div>
                  <p className="font-medium text-foreground">Admin User</p>
                  <p className="text-xs text-muted-foreground">admin@docmind.ai</p>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">Owner</span>
            </div>
          </div>
        </div>
      )}

      {(activeTab === "ai" || activeTab === "compliance") && (
        <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground/60" />
          <h3 className="mt-3 text-base font-semibold text-foreground">Enterprise Governance & Policies</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
            Configurable SOC2 compliance rules, document retention policies, and custom LLM provider routing options will be available in future workspace releases.
          </p>
        </div>
      )}
    </div>
  );
}
