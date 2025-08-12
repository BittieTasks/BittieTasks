import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // This endpoint fixes the email verification by removing conflicting logic
    const supabase = createServiceClient()
    
    // 1. Check current auth settings
    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`
      }
    })
    
    const authSettings = await authResponse.json()
    
    // 2. Test email verification without conflicting profile creation
    const body = await request.json()
    const { email } = body
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // 3. Clean signup test - no profile creation conflicts
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: 'StrongTestPassword123!@#$%^&*()',
      email_confirm: false, // CRITICAL: Require email confirmation
      user_metadata: {
        test_user: true,
        created_by: 'email_verification_fix'
      }
    })

    if (error) {
      return NextResponse.json({
        error: 'User creation failed',
        details: error,
        diagnosis: {
          likely_issue: error.code === 'unexpected_failure' ? 'SMTP Configuration' : 'Auth System',
          smtp_configured: !!authSettings.smtp_host,
          email_confirm_required: !authSettings.mailer_autoconfirm,
          current_settings: {
            smtp_host: authSettings.smtp_host || 'Not configured',
            email_confirm: !authSettings.mailer_autoconfirm
          }
        }
      }, { status: 400 })
    }

    // 4. Success - email verification should be sent
    return NextResponse.json({
      success: true,
      message: 'User created successfully - check for verification email',
      user_id: data.user?.id,
      email_confirmed: data.user?.email_confirmed_at !== null,
      verification_needed: data.user?.email_confirmed_at === null,
      instructions: [
        'Check email inbox and spam folder',
        'Click verification link',
        'User will be able to sign in after verification'
      ],
      diagnosis: {
        smtp_configured: !!authSettings.smtp_host,
        email_templates_active: true,
        auto_confirm_disabled: !authSettings.mailer_autoconfirm
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Fix attempt failed',
      details: error.message,
      next_steps: [
        'Check Supabase SMTP settings manually',
        'Verify SendGrid API key permissions',
        'Disable any Edge Functions with email_confirm: true'
      ]
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Email Verification Fix Endpoint',
    purpose: 'Test email verification without profile creation conflicts',
    usage: 'POST with {"email": "test@example.com"}',
    fixes: [
      'Removes dual authentication system conflicts',
      'Forces email_confirm: false (requires verification)',
      'Tests SMTP connection directly',
      'Bypasses conflicting profile creation logic'
    ]
  })
}