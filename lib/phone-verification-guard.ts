// Phone verification guard utility for protecting routes
import { User } from '@supabase/supabase-js'

export interface PhoneVerificationResult {
  isVerified: boolean
  error?: string
  message?: string
}

/**
 * Check if user's phone is verified
 * Works with Supabase Auth user object
 */
export function checkPhoneVerification(user: User | null): PhoneVerificationResult {
  if (!user) {
    return {
      isVerified: false,
      error: 'Authentication required',
      message: 'Please log in to continue'
    }
  }

  // Check if phone is confirmed in Supabase Auth
  if (!user.phone_confirmed_at) {
    return {
      isVerified: false,
      error: 'Phone verification required',
      message: 'Please verify your phone number before accessing this feature. Check your messages for a verification code.'
    }
  }

  // Additional check for user metadata
  const phoneVerified = user.user_metadata?.phone_verified
  if (phoneVerified === false) {
    return {
      isVerified: false,
      error: 'Phone verification required', 
      message: 'Your phone number needs to be verified. Please check your messages for a verification code.'
    }
  }

  return {
    isVerified: true
  }
}

/**
 * Create a standardized error response for phone verification
 */
export function createPhoneVerificationErrorResponse() {
  return {
    error: 'Phone verification required',
    code: 'PHONE_NOT_VERIFIED',
    message: 'Please verify your phone number before accessing this feature',
    action: 'verify_phone',
    details: {
      step: 'Check your messages for a verification code and enter it in the app',
      resend: 'You can request a new verification code if needed'
    }
  }
}