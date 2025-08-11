import { QueryClient } from '@tanstack/react-query'

// Create a function to fetch data
export async function apiRequest(endpoint: string, options?: RequestInit) {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`)
  }

  return response
}

// Create default query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const response = await apiRequest(queryKey[0] as string)
        return response.json()
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
  },
})