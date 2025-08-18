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

// API request helper function with authentication
export async function apiRequest(method: string, url: string, data?: any) {
  // Get current session token
  const { supabase } = await import('@/lib/supabase')
  const { data: { session } } = await supabase.auth.getSession()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  // Add Authorization header if user is authenticated
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
    
    console.error('API Request failed:', {
      url,
      method,
      status: response.status,
      error: errorMessage,
      headers: Object.fromEntries(response.headers)
    })
    
    throw new Error(`${response.status}: ${errorMessage}`)
  }

  return response
}