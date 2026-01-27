declare module '@tanstack/vue-query' {
  import type { Plugin } from 'vue'
  import type { QueryClient } from '@tanstack/query-core'

  export interface VueQueryPluginOptions {
    queryClient?: QueryClient
  }

  export const VueQueryPlugin: Plugin<VueQueryPluginOptions>

  export class QueryClient {
    constructor(options?: {
      defaultOptions?: {
        queries?: {
          retry?: number
          refetchOnWindowFocus?: boolean
          staleTime?: number
          gcTime?: number
        }
        mutations?: {
          retry?: number
        }
      }
    })
  }

  export function useQuery<TData = unknown, TError = Error>(options: {
    queryKey: unknown[]
    queryFn: () => Promise<TData>
    enabled?: boolean | (() => boolean)
    staleTime?: number
    refetchOnWindowFocus?: boolean
  }): {
    data: { value: TData | undefined }
    isLoading: { value: boolean }
    isError: { value: boolean }
    error: { value: TError | null }
    refetch: () => Promise<void>
  }

  export function useMutation<TData = unknown, TError = Error, TVariables = unknown>(options: {
    mutationFn: (variables: TVariables) => Promise<TData>
    onSuccess?: (data: TData) => void | Promise<void>
    onError?: (error: TError) => void | Promise<void>
  }): {
    mutate: (variables: TVariables) => void
    mutateAsync: (variables: TVariables) => Promise<TData>
    isLoading: { value: boolean }
    isError: { value: boolean }
    error: { value: TError | null }
    data: { value: TData | undefined }
  }

  export function useQueryClient(): QueryClient
}


