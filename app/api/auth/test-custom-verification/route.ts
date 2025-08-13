import { NextRequest, NextResponse } from 'next/server'
import { emailVerification } from '@/lib/email-verification'

export async function POST(request: NextRequest) {
  try {
    console.log('Testing custom email verification system...')
    
    // Test sending verification email
    const testUserId = 'test-user-' + Date.now()
    const testEmail = `test-${Date.now()}@example.com`
    
    console.log(`Sending test verification email to: ${testEmail}`)
    
    const emailSent = await emailVerification.sendVerificationEmail(testUserId, testEmail)
    
    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Custom verification email sent successfully!',
        testEmail: testEmail,
        testUserId: testUserId,
        status: 'CUSTOM_VERIFICATION_WORKING'
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Custom verification email failed to send',
        testEmail: testEmail,
        testUserId: testUserId,
        status: 'CUSTOM_VERIFICATION_FAILED'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Custom verification test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Custom verification test error: ' + (error as Error).message,
      status: 'CUSTOM_VERIFICATION_ERROR'
    }, { status: 500 })
  }
}