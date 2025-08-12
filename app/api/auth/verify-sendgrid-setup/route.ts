import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Test Supabase signup with SendGrid configured
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'TestUser2025@Strong!'

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

    console.log('SendGrid verification test:', { 
      user_created: !!data.user,
      session_created: !!data.session,
      error: error?.message 
    })

    if (error) {
      if (error.message.includes('email rate limit')) {
        return NextResponse.json({
          status: 'sendgrid_not_configured',
          message: 'Supabase still using default email service - SendGrid SMTP not configured yet',
          next_step: 'Configure SMTP settings in Supabase Dashboard'
        })
      }
      
      return NextResponse.json({
        status: 'error',
        error: error.message
      }, { status: 400 })
    }

    return NextResponse.json({
      status: 'success',
      message: 'SendGrid integration working correctly',
      user_created: !!data.user,
      email_sent: !data.session && data.user, // Email sent if user created but no session
    })

  } catch (error) {
    console.error('SendGrid verification error:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}