import { NextRequest, NextResponse } from 'next/server'
import { sendPhoneVerification, formatPhoneNumber, isValidPhoneNumber } from '@/lib/phone-verification'

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
    const { phoneNumber, phone_number } = body
    
    // Accept both camelCase and snake_case for compatibility
    const phone = phoneNumber || phone_number

    if (!phone) {
      const response = NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
      return addCorsHeaders(response)
    }

    // Validate phone number format
    if (!isValidPhoneNumber(phone)) {
      const response = NextResponse.json(
        { error: 'Invalid phone number format. Please enter a valid US phone number.' },
        { status: 400 }
      )
      return addCorsHeaders(response)
    }

    // Format phone number with country code
    const formattedPhone = formatPhoneNumber(phone)

    // Send SMS verification code using Supabase
    const smsResult = await sendPhoneVerification(formattedPhone)

    if (!smsResult.success) {
      console.error('SMS sending failed:', smsResult.error)
      const response = NextResponse.json(
        { error: smsResult.error || 'Failed to send verification SMS' },
        { status: 500 }
      )
      return addCorsHeaders(response)
    }

    console.log(`Verification code sent to ${formattedPhone} via Supabase`)

    const response = NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
      phoneNumber: formattedPhone
    })
    return addCorsHeaders(response)

  } catch (error: any) {
    console.error('Send verification error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    // More specific error messages
    let errorMessage = 'Internal server error'
    if (error.message?.includes('Supabase') || error.message?.includes('database')) {
      errorMessage = 'SMS service temporarily unavailable'
    } else if (error.message?.includes('phone')) {
      errorMessage = 'Invalid phone number format'
    }
    
    const response = NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}