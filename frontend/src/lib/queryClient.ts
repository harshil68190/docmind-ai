import { QueryClient } from "@tanstack/react-query";

/**
 * Single QueryClient for the app. `staleTime` is set above zero because
 * most of this app's data (documents, conversations) doesn't change on
 * every render — this avoids refetch storms on tab focus while still
 * refetching reasonably often. Individual queries can override this.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
