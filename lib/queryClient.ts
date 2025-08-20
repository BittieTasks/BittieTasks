import { QueryClient } from '@tanstack/react-query'

// Global query client instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

// Simplified API request helper - no manual auth tokens needed
export async function apiRequest(method: string, url: string, data?: any) {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    const options: RequestInit = {
      method,
      headers,
    }

    if (data) {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(url, options)
    
    if (!response.ok) {
      let errorMessage
      try {
        const errorText = await response.text()
        errorMessage = errorText || response.statusText
      } catch {
        errorMessage = response.statusText
      }
      
      throw new Error(`${response.status}: ${errorMessage}`)
    }

    return response
  } catch (error: any) {
    console.error('API Request failed with error:', error)
    throw error
  }
}