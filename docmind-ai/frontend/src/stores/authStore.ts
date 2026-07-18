import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/types/auth";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setSession: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearSession: () => void;
}

/**
 * Holds only client-side session identity — server data (documents, chats,
 * etc.) stays in TanStack Query's cache, never here. This store doubles as
 * the app's "auth context": components read `isAuthenticated`/`user` via
 * the `useAuthStore` hook instead of a React Context provider, which keeps
 * auth state accessible from non-component code too (see the Axios
 * interceptor in `api/client.ts`, which reads/clears this store directly).
 *
 * `persist` mirrors state to localStorage under the "docmind-auth" key so
 * a page refresh doesn't log the user out. This is a portfolio-appropriate
 * tradeoff: an httpOnly cookie would be more XSS-resistant for the refresh
 * token in a real production deployment, but requires a same-site backend
 * cookie-setting endpoint, which is a larger change than Milestone 2 scope.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setSession: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clearSession: () =>
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false }),
    }),
    { name: "docmind-auth" }
  )
);
