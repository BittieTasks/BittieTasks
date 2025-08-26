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
      
      // Use Supabase's built-in phone auth
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalizedPhone,
      })

      if (error) {
        console.error('Supabase phone verification error:', error)
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

  // Sign up with phone and password
  async signUpWithPhone(phoneNumber: string, password: string, userData?: { firstName?: string; lastName?: string }): Promise<{ success: boolean; error?: string; user?: any }> {
    try {
      const supabase = createSupabaseClient()
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber)
      
      // Create user with phone and password
      const { data, error } = await supabase.auth.signUp({
        phone: normalizedPhone,
        password: password,
        options: {
          data: {
            first_name: userData?.firstName,
            last_name: userData?.lastName,
            phone_verified: false
          }
        }
      })

      if (error) {
        console.error('Supabase phone signup error:', error)
        
        if (error.message.includes('already registered')) {
          return { success: false, error: 'An account with this phone number already exists. Please sign in instead.' }
        }
        
        return { success: false, error: error.message || 'Failed to create account' }
      }

      if (!data.user) {
        return { success: false, error: 'Failed to create account' }
      }

      console.log('User created successfully:', data.user.id)
      return { success: true, user: data.user }
      
    } catch (error: any) {
      console.error('Error creating user:', error)
      return { success: false, error: error.message || 'Failed to create account' }
    }
  }

  // Sign in with phone and password
  async signInWithPhone(phoneNumber: string, password: string): Promise<{ success: boolean; error?: string; session?: any; user?: any }> {
    try {
      const supabase = createSupabaseClient()
      const normalizedPhone = this.normalizePhoneNumber(phoneNumber)
      
      // Sign in with phone and password
      const { data, error } = await supabase.auth.signInWithPassword({
        phone: normalizedPhone,
        password: password
      })

      if (error) {
        console.error('Supabase phone login error:', error)
        
        if (error.message.includes('Phone not confirmed')) {
          return { 
            success: false, 
            error: 'Please verify your phone number first. Check your messages for the verification code.',
          }
        } else if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Invalid phone number or password' }
        }
        
        return { success: false, error: error.message || 'Sign in failed' }
      }

      if (!data.session || !data.user) {
        return { success: false, error: 'Sign in failed' }
      }

      console.log('User signed in successfully:', data.user.id)
      return { success: true, session: data.session, user: data.user }
      
    } catch (error: any) {
      console.error('Error signing in:', error)
      return { success: false, error: error.message || 'Sign in failed' }
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