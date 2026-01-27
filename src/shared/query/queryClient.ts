// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error: No type declarations for '@tanstack/vue-query'
import { QueryClient } from '@tanstack/vue-query';

// Create a query client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
    mutations: {
      retry: 0,
    },
  },
});
