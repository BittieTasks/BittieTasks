import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Test direct Supabase email capabilities
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get current auth settings from Supabase
    const { data: authConfig, error: configError } = await supabase
      .from('auth.config')
      .select('*')
      .limit(1)
      .maybeSingle()

    // Test simple signup to see detailed error
    const testEmail = `diagnostic-${Date.now()}@example.com`
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestUser2025@Strong!',
    })

    // Analyze error details
    let diagnosis = {
      supabase_connection: 'working',
      smtp_configured: false,
      error_type: 'unknown',
      recommendation: 'Check Supabase SMTP settings'
    }

    if (error) {
      const errorMsg = error.message.toLowerCase()
      
      if (errorMsg.includes('email rate limit')) {
        diagnosis.smtp_configured = false
        diagnosis.error_type = 'default_email_service'
        diagnosis.recommendation = 'Supabase using default email - configure SMTP in dashboard'
      } else if (errorMsg.includes('smtp') || errorMsg.includes('mail')) {
        diagnosis.smtp_configured = true
        diagnosis.error_type = 'smtp_configuration_issue'
        diagnosis.recommendation = 'SMTP configured but has connection issues'
      } else if (errorMsg.includes('sending')) {
        diagnosis.smtp_configured = false
        diagnosis.error_type = 'email_service_failure'
        diagnosis.recommendation = 'Email service not properly configured'
      }
    }

    return NextResponse.json({
      status: 'diagnostic_complete',
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      test_email: testEmail,
      signup_result: {
        user_created: !!data.user,
        session_created: !!data.session,
        error_message: error?.message || 'none'
      },
      diagnosis,
      detailed_error: error ? {
        name: error.name,
        message: error.message,
        status: (error as any).status,
        code: (error as any).code
      } : null,
      next_steps: [
        'Go to Supabase Dashboard → Settings → Auth',
        'Configure SMTP with SendGrid settings',
        'Verify sender domain matches noreply@bittietasks.com'
      ]
    })

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}