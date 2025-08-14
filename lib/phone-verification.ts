import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client for auth operations
function getSupabaseClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable must be set')
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable must be set')
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export interface PhoneVerificationResult {
  success: boolean
  data?: any
  error?: string
}

export async function sendPhoneVerification(phoneNumber: string): Promise<PhoneVerificationResult> {
  try {
    console.log(`Sending SMS verification to: ${phoneNumber}`)
    
    const supabase = getSupabaseClient()
    
    // Use Supabase's built-in SMS OTP
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
      options: {
        channel: 'sms'
      }
    })

    if (error) {
      console.error('Supabase SMS error:', error)
      return {
        success: false,
        error: error.message || 'Failed to send verification SMS'
      }
    }

    console.log(`SMS sent successfully via Supabase`)
    
    return {
      success: true,
      data
    }
  } catch (error: any) {
    console.error('Phone verification error:', error)
    return {
      success: false,
      error: error.message || 'Failed to send verification SMS'
    }
  }
}

export async function verifyPhoneCode(phoneNumber: string, code: string): Promise<PhoneVerificationResult> {
  try {
    console.log(`Verifying SMS code for: ${phoneNumber}`)
    
    const supabase = getSupabaseClient()
    
    // Verify the OTP code
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: code,
      type: 'sms'
    })

    if (error) {
      console.error('Supabase verification error:', error)
      return {
        success: false,
        error: error.message || 'Invalid verification code'
      }
    }

    console.log(`Phone verification successful for ${phoneNumber}`)
    
    return {
      success: true,
      data
    }
  } catch (error: any) {
    console.error('Phone verification error:', error)
    return {
      success: false,
      error: error.message || 'Failed to verify phone number'
    }
  }
}

export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '')
  
  // Add US country code if not present
  if (digits.length === 10) {
    return `+1${digits}`
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }
  
  // Return as-is if it already has country code
  return phoneNumber.startsWith('+') ? phoneNumber : `+${digits}`
}

export function isValidPhoneNumber(phoneNumber: string): boolean {
  const digits = phoneNumber.replace(/\D/g, '')
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'))
}