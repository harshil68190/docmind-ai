import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

/**
 * Gates access to authenticated routes. Real login/register wiring lands in
 * Milestone 2 — this component is not a stub to be replaced later, it's the
 * permanent gate; only `useAuthStore`'s contents will grow (e.g. token
 * refresh handling), not this component's logic.
 */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
