import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('=== DEBUG SUBSCRIPTION API START ===')
    
    // Check environment variables
    const envCheck = {
      hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSupabaseService: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV
    }
    console.log('Environment check:', envCheck)
    
    // Check Authorization header
    const authHeader = request.headers.get('Authorization')
    console.log('Auth header check:', {
      hasHeader: !!authHeader,
      headerStart: authHeader?.substring(0, 20),
      headerLength: authHeader?.length
    })
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Authentication required - missing token',
        debug: { envCheck, hasAuthHeader: !!authHeader }
      }, { status: 401 })
    }

    // Extract JWT token
    const jwt = authHeader.replace('Bearer ', '')
    console.log('JWT token check:', {
      jwtLength: jwt.length,
      jwtStart: jwt.substring(0, 20),
      jwtEnd: jwt.substring(jwt.length - 20)
    })
    
    // Test Supabase client creation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${jwt}`
        }
      }
    })
    
    console.log('Supabase client created successfully')
    
    // Test user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('Auth result:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      errorMessage: authError?.message,
      errorStatus: authError?.status
    })
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Authentication failed',
        debug: {
          envCheck,
          authError: authError?.message,
          authStatus: authError?.status,
          hasUser: !!user
        }
      }, { status: 401 })
    }

    // Test Stripe import
    try {
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
      console.log('Stripe initialized successfully')
    } catch (stripeError: any) {
      console.error('Stripe initialization failed:', stripeError)
      return NextResponse.json({ 
        error: 'Stripe initialization failed',
        debug: { stripeError: stripeError.message }
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      debug: {
        envCheck,
        user: {
          id: user.id,
          email: user.email,
          metadata: user.user_metadata
        },
        message: 'All checks passed - subscription should work'
      }
    })
    
  } catch (error: any) {
    console.error('Debug subscription error:', error)
    return NextResponse.json({ 
      error: 'Debug failed',
      debug: {
        errorMessage: error.message,
        errorStack: error.stack
      }
    }, { status: 500 })
  }
}