import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const testEmail = `testuser${Date.now()}@gmail.com`
    const testPassword = 'ComplexP@ssw0rd2025!'

    console.log('Testing signup flow with:', testEmail)

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
        }
      }
    })

    console.log('Signup result:', {
      user: data.user?.id,
      session: data.session?.access_token?.substring(0, 20) + '...',
      error: error?.message
    })

    if (error) {
      // Check if it's still a rate limit error
      if (error.message.includes('email rate limit')) {
        return NextResponse.json({
          status: 'smtp_not_configured',
          message: 'Still getting rate limit - SMTP configuration may need time to apply',
          error: error.message,
          troubleshooting: [
            'Wait 5-10 minutes for Supabase SMTP changes to take effect',
            'Verify SMTP settings are saved in Supabase dashboard',
            'Check that SendGrid sender is verified'
          ]
        })
      }

      // Check for other auth errors
      return NextResponse.json({
        status: 'auth_error',
        error: error.message,
        details: 'Authentication error occurred'
      })
    }

    // Success case
    if (data.user && !data.session) {
      return NextResponse.json({
        status: 'success_email_sent',
        message: 'User created successfully - verification email sent via SendGrid!',
        user_id: data.user.id,
        email_confirmation_required: true
      })
    }

    if (data.user && data.session) {
      return NextResponse.json({
        status: 'success_auto_login',
        message: 'User created and logged in automatically',
        user_id: data.user.id,
        email_confirmation_required: false
      })
    }

    return NextResponse.json({
      status: 'unexpected',
      message: 'Unexpected response from Supabase',
      data
    })

  } catch (error) {
    console.error('Complete flow test error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}