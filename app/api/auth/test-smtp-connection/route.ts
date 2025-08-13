import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    // Test with a completely fresh email to avoid rate limits
    const timestamp = Date.now()
    const testEmail = `smtp-test-${timestamp}@example.com`
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    console.log(`Testing SMTP with fresh email: ${testEmail}`)

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestUser2025@Strong!',
      options: {
        data: {
          first_name: 'SMTP',
          last_name: 'Test'
        }
      }
    })

    // Analyze the response in detail
    const analysis = {
      timestamp,
      test_email: testEmail,
      user_created: !!data.user,
      session_created: !!data.session,
      error_occurred: !!error,
      smtp_status: 'unknown'
    }

    if (error) {
      const errorMsg = error.message.toLowerCase()
      
      if (errorMsg.includes('rate limit')) {
        analysis.smtp_status = 'supabase_default_service'
        return NextResponse.json({
          status: 'failed',
          reason: 'Still using Supabase default email service',
          analysis,
          error: error.message,
          recommendation: 'SMTP configuration not applied yet. Check Supabase dashboard SMTP settings.'
        })
      } else if (errorMsg.includes('sending') || errorMsg.includes('mail')) {
        analysis.smtp_status = 'smtp_configured_but_failing'
        return NextResponse.json({
          status: 'progress',
          reason: 'SMTP configured but connection issues',
          analysis,
          error: error.message,
          recommendation: 'Check SMTP credentials: Host, Port, Username (apikey), Password (SendGrid API key)'
        })
      } else {
        analysis.smtp_status = 'other_error'
        return NextResponse.json({
          status: 'error',
          reason: 'Unexpected error',
          analysis,
          error: error.message
        })
      }
    }

    // Success case
    if (data.user && !data.session) {
      analysis.smtp_status = 'working_correctly'
      return NextResponse.json({
        status: 'success',
        reason: 'SMTP working! User created, email verification sent.',
        analysis,
        message: 'Supabase is now using SendGrid SMTP successfully!'
      })
    }

    return NextResponse.json({
      status: 'unexpected',
      analysis,
      data,
      message: 'Unexpected response pattern'
    })

  } catch (error) {
    console.error('SMTP test error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}