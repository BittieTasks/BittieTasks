import { NextRequest, NextResponse } from 'next/server'
import { verifyPhoneCode } from '@/lib/phone-verification'

// Add CORS headers for better browser compatibility
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}

export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(new NextResponse(null, { status: 200 }))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneNumber, code } = body

    if (!phoneNumber || !code) {
      const response = NextResponse.json(
        { error: 'Phone number and verification code are required' },
        { status: 400 }
      )
      return addCorsHeaders(response)
    }

    // Use Supabase's built-in OTP verification
    const verificationResult = await verifyPhoneCode(phoneNumber, code)

    if (!verificationResult.success) {
      console.error('Phone verification failed:', verificationResult.error)
      const response = NextResponse.json(
        { error: verificationResult.error || 'Invalid verification code' },
        { status: 400 }
      )
      return addCorsHeaders(response)
    }

    console.log(`Phone number verified successfully: ${phoneNumber}`)

    const response = NextResponse.json({
      success: true,
      message: 'Phone number verified successfully',
      phoneNumber: phoneNumber,
      session: verificationResult.data?.session,
      user: verificationResult.data?.user
    })
    return addCorsHeaders(response)

  } catch (error: any) {
    console.error('Phone verification error:', error)
    const response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}