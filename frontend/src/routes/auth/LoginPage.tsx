import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/errors";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    login.mutate({ email, password });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 select-none animate-fade-in">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            DocMind <span className="text-primary">AI</span>
          </h1>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-1">
            Enterprise Knowledge Platform
          </p>
          <p className="mt-2 text-sm text-muted-foreground/80">
            AI-powered document intelligence for organizations.
          </p>
        </div>

        {/* Card Form */}
        <div className="rounded-xl border border-border/80 bg-card p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground">Sign in to your workspace</h2>
            <p className="text-xs text-muted-foreground">Enter your enterprise credentials to continue.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="h-10 text-sm"
              />
            </div>

            {login.isError && (
              <p role="alert" className="rounded-md bg-destructive/10 p-2.5 text-xs font-medium text-destructive">
                {getApiErrorMessage(login.error)}
              </p>
            )}

            <Button type="submit" className="w-full h-10 font-medium" disabled={login.isPending}>
              {login.isPending ? "Signing in..." : "Sign in to Platform"}
            </Button>
          </form>

          <div className="mt-6 border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">
            Don&apos;t have an enterprise account?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

