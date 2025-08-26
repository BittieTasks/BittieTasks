// Email verification guard utility for protecting routes
import { User } from '@supabase/supabase-js'

export interface EmailVerificationResult {
  isVerified: boolean
  error?: string
  message?: string
}

/**
 * Check if user's email is verified
 * Works with Supabase Auth user object
 */
export function checkEmailVerification(user: User | null): EmailVerificationResult {
  if (!user) {
    return {
      isVerified: false,
      error: 'Authentication required',
      message: 'Please log in to continue'
    }
  }

  // Check if email is confirmed in Supabase Auth
  if (!user.email_confirmed_at) {
    return {
      isVerified: false,
      error: 'Email verification required',
      message: 'Please verify your email address before accessing this feature. Check your inbox for a verification link.'
    }
  }

  // Additional check for user metadata
  const emailVerified = user.user_metadata?.email_verified
  if (emailVerified === false) {
    return {
      isVerified: false,
      error: 'Email verification required', 
      message: 'Your email address needs to be verified. Please check your inbox for a verification link.'
    }
  }

  return {
    isVerified: true
  }
}

/**
 * Create a standardized error response for email verification
 */
export function createEmailVerificationErrorResponse() {
  return {
    error: 'Email verification required',
    code: 'EMAIL_NOT_VERIFIED',
    message: 'Please verify your email address before completing tasks or subscribing',
    action: 'verify_email',
    details: {
      step: 'Check your inbox for a verification email and click the verification link',
      resend: 'If you need a new verification email, contact support'
    }
  }
}