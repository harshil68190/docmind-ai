import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";

export function Topbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  const userInitials = user?.email
    ? user.email.substring(0, 2).toUpperCase()
    : "DM";

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/80 bg-card/40 px-8 backdrop-blur-xs select-none">
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Knowledge Base
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your organization's documents with AI.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/30 py-1 pl-1.5 pr-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary text-sm font-bold ring-1 ring-primary/20">
            {userInitials}
          </div>
          <span className="text-sm font-medium text-foreground">{user?.email}</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          <LogOut className="h-3.5 w-3.5" />
          {logout.isPending ? "Signing out..." : "Sign out"}
        </Button>
      </div>
    </header>
  );
}

