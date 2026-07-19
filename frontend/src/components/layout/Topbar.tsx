import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";

export function Topbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-8">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{user?.email}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          {logout.isPending ? "Signing out..." : "Sign out"}
        </Button>
      </div>
    </header>
  );
}
