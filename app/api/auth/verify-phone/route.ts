import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const { phoneNumber, code } = body

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'Phone number and verification code are required' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Find verification code record
    const { data: verificationRecord, error: fetchError } = await supabase
      .from('phone_verification_codes')
      .select('*')
      .eq('phoneNumber', phoneNumber)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !verificationRecord) {
      console.error('Verification code not found:', fetchError)
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      )
    }

    // Check if code has expired
    const now = new Date()
    const expiresAt = new Date(verificationRecord.expiresAt)
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new code.' },
        { status: 400 }
      )
    }

    // Check attempt limit (max 3 attempts)
    if (verificationRecord.attempts >= 3) {
      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new verification code.' },
        { status: 400 }
      )
    }

    // Verify the code
    if (verificationRecord.code !== code) {
      // Increment attempts
      await supabase
        .from('phone_verification_codes')
        .update({ attempts: verificationRecord.attempts + 1 })
        .eq('id', verificationRecord.id)

      return NextResponse.json(
        { error: 'Invalid verification code. Please try again.' },
        { status: 400 }
      )
    }

    // Mark code as verified
    await supabase
      .from('phone_verification_codes')
      .update({ verified: true })
      .eq('id', verificationRecord.id)

    console.log(`Phone number verified successfully: ${phoneNumber}`)

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully',
      phoneNumber: phoneNumber
    })

  } catch (error: any) {
    console.error('Phone verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}