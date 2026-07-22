import { NavLink } from "react-router-dom";
import { Home, FileText, Bot, Building2, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/chat", label: "AI Assistant", icon: Bot },
  { to: "/workspace", label: "Workspace", icon: Building2 },
] as const;

export function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border/80 bg-card/60 px-4 py-6 backdrop-blur-sm select-none">
      {/* Brand Header */}
      <div className="mb-8 px-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/20">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground leading-none">
              DocMind <span className="text-primary">AI</span>
            </h1>
            <p className="mt-1 text-[11px] font-medium text-muted-foreground tracking-tight">
              Enterprise Knowledge Platform
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-1.5">
        <p className="px-2 pb-1 text-[10px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
          Platform
        </p>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary/10 text-primary font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-105",
                    isActive ? "text-primary" : "text-muted-foreground/80 group-hover:text-foreground"
                  )}
                />
                <span className="truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer Branding info */}
      <div className="mt-auto border-t border-border/60 pt-4 px-2">
        <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
          DocMind AI Enterprise
          <br />
          <span className="text-[10px] text-muted-foreground/60">v1.0 • Knowledge Systems</span>
        </p>
      </div>
    </aside>
  );
}

