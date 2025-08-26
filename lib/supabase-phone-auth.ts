// Supabase native phone authentication service
import { createClient } from '@supabase/supabase-js'

// Create admin client for server-side operations
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

// Create client for auth operations
function createSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export class SupabasePhoneAuthService {
  
  // Send verification code via Supabase's built-in SMS
  async sendVerificationCode(phoneNumber: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createSupabaseClient()
      
      // Normalize phone number to E.164 format
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber)
      console.log('Attempting to send OTP to:', normalizedPhone)
      
      // Use Supabase's built-in phone auth
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
      })

      if (error) {
        console.error('Supabase phone verification error:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        
        // Provide more specific error messages
        if (error.message.includes('Phone provider not configured')) {
          return { success: false, error: 'Phone authentication is not properly configured. Please contact support.' }
        } else if (error.message.includes('Invalid phone number')) {
          return { success: false, error: 'Invalid phone number format. Please use a valid US phone number.' }
        } else if (error.message.includes('Rate limit')) {
          return { success: false, error: 'Too many attempts. Please wait a few minutes before trying again.' }
        }
        
        return { success: false, error: error.message || 'Failed to send verification code' }
      }

      console.log('Verification code sent successfully via Supabase to:', normalizedPhone)
      return { success: true }
      
    } catch (error: any) {
      console.error('Error sending verification code:', error)
      return { success: false, error: error.message || 'Failed to send verification code' }
    }
  }

  // Verify code using Supabase
  async verifyCode(phoneNumber: string, code: string): Promise<{ success: boolean; error?: string; session?: any }> {
    try {
      const supabase = createSupabaseClient()
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber)
      
      // Verify the OTP code
      const { data, error } = await supabase.auth.verifyOtp({
        phone: normalizedPhone,
        token: code,
        type: 'sms'
      })

      if (error) {
        console.error('Supabase code verification error:', error)
        
        // Provide user-friendly error messages
        if (error.message.includes('expired')) {
          return { success: false, error: 'Verification code has expired. Please request a new code.' }
        } else if (error.message.includes('invalid')) {
          return { success: false, error: 'Invalid verification code. Please check and try again.' }
        }
        
        return { success: false, error: error.message || 'Invalid verification code' }
      }

      if (!data.session || !data.user) {
        return { success: false, error: 'Verification failed. Please try again.' }
      }

      console.log('Phone verification successful for user:', data.user.id)
      return { success: true, session: data.session }
      
    } catch (error: any) {
      console.error('Error verifying code:', error)
      return { success: false, error: error.message || 'Failed to verify code' }
    }
  }

  // Sign up with phone only (passwordless)
  async signUpWithPhone(phoneNumber: string, userData?: { firstName?: string; lastName?: string }): Promise<{ success: boolean; error?: string; needsVerification?: boolean }> {
    try {
      const supabase = createSupabaseClient()
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber)
      console.log('Attempting signup for phone:', normalizedPhone)
      
      // Check if user already exists
      const existingUser = await this.isPhoneVerified(normalizedPhone)
      if (existingUser) {
        return { success: false, error: 'An account with this phone number already exists. Please sign in instead.' }
      }
      
      // Use Supabase's OTP signup (passwordless)
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
        options: {
          data: {
            first_name: userData?.firstName,
            last_name: userData?.lastName
          }
        }
      })

      if (error) {
        console.error('Supabase phone signup error:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        
        if (error.message.includes('Signup disabled')) {
          return { success: false, error: 'Phone signup is currently disabled. Please contact support.' }
        } else if (error.message.includes('Phone provider not configured')) {
          return { success: false, error: 'Phone authentication is not properly configured. Please contact support.' }
        } else if (error.message.includes('Rate limit')) {
          return { success: false, error: 'Too many attempts. Please wait a few minutes before trying again.' }
        }
        
        return { success: false, error: error.message || 'Failed to send verification code' }
      }

      console.log('Verification code sent for signup to:', normalizedPhone)
      return { success: true, needsVerification: true }
      
    } catch (error: any) {
      console.error('Error signing up:', error)
      return { success: false, error: error.message || 'Failed to send verification code' }
    }
  }

  // Sign in with phone only (passwordless)
  async signInWithPhone(phoneNumber: string): Promise<{ success: boolean; error?: string; needsVerification?: boolean }> {
    try {
      const supabase = createSupabaseClient()
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber)
      console.log('Attempting login for phone:', normalizedPhone)
      
      // Send OTP for sign in
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone
      })

      if (error) {
        console.error('Supabase phone login error:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        
        if (error.message.includes('User not found')) {
          return { success: false, error: 'No account found with this phone number. Please sign up first.' }
        } else if (error.message.includes('Phone provider not configured')) {
          return { success: false, error: 'Phone authentication is not properly configured. Please contact support.' }
        } else if (error.message.includes('Rate limit')) {
          return { success: false, error: 'Too many attempts. Please wait a few minutes before trying again.' }
        }
        
        return { success: false, error: error.message || 'Failed to send verification code' }
      }

      console.log('Verification code sent for login to:', normalizedPhone)
      return { success: true, needsVerification: true }
      
    } catch (error: any) {
      console.error('Error signing in:', error)
      return { success: false, error: error.message || 'Failed to send verification code' }
    }
  }

  // Check if phone number is already verified
  async isPhoneVerified(phoneNumber: string): Promise<boolean> {
    try {
      const supabaseAdmin = createSupabaseAdmin()
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber)
      
      // Check if user exists with verified phone
      const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()
      
      if (error) {
        console.error('Error checking phone verification:', error)
        return false
      }

      const user = users.users.find(u => u.phone === normalizedPhone && u.phone_confirmed_at)
      return !!user
      
    } catch (error) {
      console.error('Error checking phone verification:', error)
      return false
    }
  }

  // Normalize phone number to E.164 format
  private normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '')
    
    // Add +1 for US numbers if not present
    if (digits.length === 10) {
      return `+1${digits}`
    } else if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`
    }
    
    // Return as-is for international numbers
    return digits.startsWith('+') ? phone : `+${digits}`
  }
}

export const supabasePhoneAuth = new SupabasePhoneAuthService()