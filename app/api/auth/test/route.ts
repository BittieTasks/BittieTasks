import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Test environment variables
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }

    // Test Supabase connection
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    // Test database connection
    let dbConnection = false
    try {
      const { data, error } = await supabase
        .from('auth.users')
        .select('count', { count: 'exact' })
        .limit(1)
      
      dbConnection = !error
    } catch (e) {
      dbConnection = false
    }

    // Get request info
    const requestInfo = {
      origin: request.headers.get('origin'),
      userAgent: request.headers.get('user-agent'),
      host: request.headers.get('host'),
      protocol: request.url.startsWith('https') ? 'https' : 'http'
    }

    // Check auth header
    const authHeader = request.headers.get('authorization')
    const hasValidAuthHeader = authHeader && authHeader.startsWith('Bearer ')

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        ...envCheck,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
      },
      supabase: {
        connected: !sessionError && !userError,
        session: !!session,
        user: !!user,
        sessionError: sessionError?.message,
        userError: userError?.message,
        dbConnection
      },
      request: requestInfo,
      authentication: {
        hasAuthHeader: !!authHeader,
        hasValidAuthHeader,
        isAuthenticated: !!session?.user,
        userId: user?.id || null,
        userEmail: user?.email || null
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (action === 'test-signup') {
      const { email, password } = body
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${request.headers.get('origin')}/auth/callback`
        }
      })

      return NextResponse.json({
        success: !error,
        needsEmailConfirmation: !data.user?.email_confirmed_at,
        user: data.user,
        error: error?.message
      })
    }

    if (action === 'test-signin') {
      const { email, password } = body
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      return NextResponse.json({
        success: !error,
        session: data.session,
        user: data.user,
        error: error?.message
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}