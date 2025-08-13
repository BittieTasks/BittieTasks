import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendPhoneVerification, formatPhoneNumber, isValidPhoneNumber } from '@/lib/phone-verification'

// Admin client for database operations
function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
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
    const { phoneNumber, phone_number } = body
    
    // Accept both camelCase and snake_case for compatibility
    const phone = phoneNumber || phone_number

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Validate phone number format
    if (!isValidPhoneNumber(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Please enter a valid US phone number.' },
        { status: 400 }
      )
    }

    // Format phone number with country code
    const formattedPhone = formatPhoneNumber(phone)

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Store verification code in database
    const supabase = getSupabaseAdmin()
    
    // Delete any existing codes for this phone number
    await supabase
      .from('phone_verification_codes')
      .delete()
      .eq('phone_number', formattedPhone)

    // Insert new verification code
    const { error: dbError } = await supabase
      .from('phone_verification_codes')
      .insert({
        phone_number: formattedPhone,
        code: verificationCode,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      })

    if (dbError) {
      console.error('Database error storing verification code:', dbError)
      return NextResponse.json(
        { error: 'Failed to store verification code' },
        { status: 500 }
      )
    }

    // Send SMS verification code
    const smsResult = await sendPhoneVerification(formattedPhone, verificationCode)

    if (!smsResult.success) {
      console.error('SMS sending failed:', smsResult.error)
      return NextResponse.json(
        { error: smsResult.error || 'Failed to send verification SMS' },
        { status: 500 }
      )
    }

    console.log(`Verification code sent to ${formattedPhone}, SMS SID: ${smsResult.sid}`)

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
      phoneNumber: formattedPhone
    })

  } catch (error: any) {
    console.error('Send verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}