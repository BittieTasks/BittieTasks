import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    // Use a completely unique email with timestamp to avoid any caching issues
    const uniqueId = Math.random().toString(36).substring(7)
    const timestamp = Date.now()
    const testEmail = `final-test-${uniqueId}-${timestamp}@example.com`
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    console.log(`Final SMTP verification with email: ${testEmail}`)

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'StrongPassword2025!',
      options: {
        data: {
          first_name: 'Final',
          last_name: 'Test'
        }
      }
    })

    const result = {
      test_email: testEmail,
      timestamp,
      user_created: !!data.user,
      session_created: !!data.session,
      error_message: error?.message || null,
      smtp_diagnosis: ''
    }

    if (!error) {
      // Success - user created without session means email verification sent
      result.smtp_diagnosis = 'SUCCESS: SendGrid SMTP working correctly'
      return NextResponse.json({
        status: 'success',
        message: 'SMTP configuration successful! Supabase is now using SendGrid.',
        result,
        next_step: 'Email verification system is now functional'
      })
    }

    // Analyze error types
    const errorMsg = error.message.toLowerCase()
    
    if (errorMsg.includes('rate limit') || errorMsg.includes('email limit')) {
      result.smtp_diagnosis = 'FAILED: Still using Supabase default email service'
      return NextResponse.json({
        status: 'not_configured',
        message: 'SMTP configuration not applied. Supabase still using default email.',
        result,
        troubleshooting: [
          'Verify SMTP settings were saved in Supabase dashboard',
          'Check all required fields: Host, Port, Username, Password, Sender',
          'Wait 2-3 minutes for changes to propagate',
          'Try disabling and re-enabling SMTP in dashboard'
        ]
      })
    }

    if (errorMsg.includes('sending') || errorMsg.includes('smtp') || errorMsg.includes('mail')) {
      result.smtp_diagnosis = 'PARTIAL: SMTP configured but connection failing'
      return NextResponse.json({
        status: 'connection_issue',
        message: 'SMTP configured but unable to connect to SendGrid',
        result,
        troubleshooting: [
          'Verify SendGrid API key is correct (starts with SG.)',
          'Check SMTP username is exactly: apikey',
          'Confirm sender email: noreply@bittietasks.com',
          'Verify SendGrid account is active and not suspended'
        ]
      })
    }

    // Other error
    result.smtp_diagnosis = 'UNKNOWN: Unexpected error type'
    return NextResponse.json({
      status: 'unknown_error',
      message: 'Unexpected error during SMTP test',
      result,
      error: error.message
    })

  } catch (error) {
    console.error('Final SMTP verification error:', error)
    return NextResponse.json({
      status: 'test_failed',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}