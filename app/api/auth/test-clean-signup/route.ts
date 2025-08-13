import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    // Test with completely fresh credentials after email template fix
    const cleanTestId = Math.random().toString(36).substring(7)
    const testEmail = `clean-${cleanTestId}@example.com`
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    console.log(`Testing clean signup after email template fix: ${testEmail}`)

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'CleanTest2025!',
    })

    if (!error && data.user && !data.session) {
      return NextResponse.json({
        status: 'SUCCESS',
        message: 'Email template fix worked! SMTP now functional.',
        details: {
          user_id: data.user.id,
          email_sent: true,
          verification_required: true
        },
        confirmation: 'Supabase is now successfully using SendGrid SMTP'
      })
    }

    if (error) {
      const errorMsg = error.message.toLowerCase()
      
      if (errorMsg.includes('rate limit')) {
        return NextResponse.json({
          status: 'STILL_FAILING',
          message: 'Extra spaces were not the issue - still using default email service',
          error: error.message,
          next_troubleshooting: 'Check other SMTP configuration details'
        })
      }

      return NextResponse.json({
        status: 'DIFFERENT_ERROR',
        message: 'Progress made but new error appeared',
        error: error.message,
        analysis: 'Email template fix may have helped but other config issue remains'
      })
    }

    return NextResponse.json({
      status: 'UNEXPECTED',
      data,
      message: 'Unexpected response pattern'
    })

  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}