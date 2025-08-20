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
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('apiRequest: Session check:', { 
      hasSession: !!session, 
      hasToken: !!session?.access_token,
      tokenLength: session?.access_token?.length || 0,
      sessionError: sessionError?.message
    })
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add auth header if user is signed in
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
      console.log('apiRequest: Added Authorization header with token length:', session.access_token.length)
    } else {
      console.log('apiRequest: No valid access token found in session')
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