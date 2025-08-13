import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    // Test with port 587 configuration
    const finalTestId = `port587-${Math.random().toString(36).substring(7)}`
    const testEmail = `${finalTestId}@example.com`
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    console.log(`Final verification test with port 587: ${testEmail}`)

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'Port587Test2025!',
      options: {
        data: {
          test_type: 'port_587_verification'
        }
      }
    })

    // Success case - user created without session means email verification sent
    if (!error && data.user && !data.session) {
      return NextResponse.json({
        status: 'SUCCESS',
        message: 'SMTP working! Port 587 configuration successful.',
        result: {
          user_id: data.user.id,
          email: testEmail,
          email_confirmation_sent: true,
          smtp_status: 'functional'
        },
        confirmation: 'Supabase successfully connected to SendGrid via SMTP'
      })
    }

    // Error analysis
    if (error) {
      const errorMsg = error.message.toLowerCase()
      
      if (errorMsg.includes('rate limit')) {
        return NextResponse.json({
          status: 'SMTP_NOT_CONFIGURED',
          message: 'Back to rate limits - SMTP configuration lost',
          error: error.message,
          action_needed: 'Re-verify SMTP settings in Supabase dashboard'
        })
      }

      if (errorMsg.includes('sending') || errorMsg.includes('mail')) {
        return NextResponse.json({
          status: 'SMTP_CONNECTION_FAILING',
          message: 'SMTP configured but still failing to connect',
          error: error.message,
          next_steps: [
            'Check SendGrid API key SMTP permissions',
            'Verify API key is not restricted',
            'Try creating new API key with full permissions'
          ]
        })
      }

      return NextResponse.json({
        status: 'OTHER_ERROR',
        error: error.message,
        analysis: 'Unexpected error type'
      })
    }

    // Unexpected success with session
    return NextResponse.json({
      status: 'UNEXPECTED_SUCCESS',
      message: 'User created with session - email verification may be disabled',
      data,
      note: 'This might indicate email confirmation is disabled'
    })

  } catch (error) {
    console.error('Final verification test error:', error)
    return NextResponse.json({
      status: 'TEST_ERROR',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}