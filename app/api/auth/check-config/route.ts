import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Try to get current auth settings (this might fail but will show what's configured)
    const testResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    let authConfig = null
    if (testResponse.ok) {
      authConfig = await testResponse.json()
    }

    return NextResponse.json({
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      auth_endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1`,
      auth_config: authConfig,
      environment_check: {
        has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        has_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        has_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      recommendations: [
        'Check Supabase Dashboard → Authentication → Settings',
        'Verify email confirmation is disabled for testing',
        'Check if SendGrid is properly connected',
        'Consider using Supabase built-in SMTP temporarily'
      ]
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Configuration check failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}