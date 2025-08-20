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

// API request helper with proper Supabase authentication
export async function apiRequest(method: string, url: string, data?: any) {
  try {
    // Get current session for authentication
    const { supabase } = await import('@/lib/supabase')
    const { data: { session } } = await supabase.auth.getSession()
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add auth header if user is signed in
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
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