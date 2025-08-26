import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { phoneVerificationService } from '@/lib/phone-verification'

// Create admin client
function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, code } = body

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'Phone number and verification code are required' },
        { status: 400 }
      )
    }

    // Verify the code
    const verificationResult = await phoneVerificationService.verifyCode(phoneNumber, code)
    
    if (!verificationResult.success) {
      return NextResponse.json(
        { error: verificationResult.error },
        { status: 400 }
      )
    }

    // Normalize phone number
    const normalizedPhone = phoneNumber.replace(/\D/g, '')
    let formattedPhone = normalizedPhone
    
    if (normalizedPhone.length === 10) {
      formattedPhone = `+1${normalizedPhone}`
    } else if (normalizedPhone.length === 11 && normalizedPhone.startsWith('1')) {
      formattedPhone = `+${normalizedPhone}`
    } else {
      formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${normalizedPhone}`
    }

    // Update user as verified in Supabase Auth
    const supabaseAdmin = createSupabaseAdmin()
    const { data: users } = await supabaseAdmin.auth.admin.listUsers()
    const user = users.users.find(u => u.phone === formattedPhone)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Mark phone as verified
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        phone_confirm: true,
        user_metadata: {
          ...user.user_metadata,
          phone_verified: true,
          phone_confirmed_at: new Date().toISOString()
        }
      }
    )

    if (updateError) {
      console.error('Error updating user phone verification:', updateError)
      return NextResponse.json(
        { error: 'Failed to verify phone number. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully! You can now sign in.',
      redirectUrl: '/auth?tab=signin'
    })
    
  } catch (error: any) {
    console.error('Phone verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}