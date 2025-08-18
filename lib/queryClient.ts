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
  try {
    // Get current session token
    const { supabase } = await import('@/lib/supabase')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('API Request auth state:', {
      hasSession: !!session,
      hasToken: !!session?.access_token,
      tokenLength: session?.access_token?.length,
      sessionError: sessionError?.message,
      url,
      method
    })
    
    if (sessionError) {
      throw new Error(`Session error: ${sessionError.message}`)
    }
    
    if (!session?.access_token) {
      throw new Error('No authentication token available - please sign in')
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    }
    
    console.log('Added auth header with token length:', session.access_token.length)

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
  } catch (error: any) {
    console.error('API Request failed with error:', error)
    throw error
  }
}