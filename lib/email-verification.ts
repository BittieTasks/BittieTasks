import { createClient } from '@supabase/supabase-js'
import { sendEmail } from './sendgrid'
import { randomBytes } from 'crypto'
import { ensureVerificationTable } from './database-setup'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface VerificationToken {
  id: string
  user_id: string
  email: string
  token: string
  expires_at: string
  created_at: string
}

export class EmailVerificationService {
  
  // Generate secure verification token
  private generateVerificationToken(): string {
    return randomBytes(32).toString('hex')
  }

  // Send verification email using SendGrid  
  async sendVerificationEmail(userId: string, email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Ensure table exists first
      await ensureVerificationTable()
      
      const token = this.generateVerificationToken()
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      
      // Store token in Supabase using service role client to bypass RLS
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        throw new Error('Supabase environment variables are required')
      }
      
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
      
      const { error: dbError } = await supabaseAdmin
        .from('verification_tokens')
        .upsert({
          user_id: userId,
          email: email,
          token: token,
          expires_at: expiresAt.toISOString()
        })

      if (dbError) {
        console.error('Database error storing verification token:', dbError)
        return { success: false, error: 'Failed to store verification token' }
      }

      // Create verification URL - use request header for development
      let baseUrl = process.env.NEXT_PUBLIC_SITE_URL
      if (!baseUrl) {
        // In development, construct from available environment variables
        const isDev = process.env.NODE_ENV === 'development'
        if (isDev) {
          baseUrl = 'http://localhost:5000'
        } else {
          baseUrl = 'https://www.bittietasks.com'
        }
      }
      const verificationUrl = `${baseUrl}/verify-email?token=${token}`
      
      // Send email via SendGrid
      const emailResult = await sendEmail({
        to: email,
        from: 'noreply@bittietasks.com',
        subject: 'Verify Your BittieTasks Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 60px; height: 60px; background: #0d9488; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <span style="color: white; font-weight: bold; font-size: 24px;">B</span>
              </div>
              <h1 style="color: #0d9488; margin: 0;">Welcome to BittieTasks!</h1>
            </div>
            
            <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
              <h2 style="color: #1f2937; margin-top: 0;">Verify Your Email Address</h2>
              <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
                Thank you for joining BittieTasks! To complete your registration and start earning from community tasks, please verify your email address.
              </p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" 
                   style="display: inline-block; background: #0d9488; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                  Verify Email Address
                </a>
              </div>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; color: #6b7280; font-size: 14px;">
              <p><strong>What's next?</strong></p>
              <ul style="margin: 10px 0;">
                <li>Browse community tasks in your area</li>
                <li>Start earning from daily activities</li>
                <li>Connect with neighbors and build community</li>
              </ul>
              
              <p style="margin-top: 20px;">
                This verification link expires in 24 hours. If you didn't create an account with BittieTasks, you can safely ignore this email.
              </p>
              
              <p style="margin-top: 20px; text-align: center; color: #9ca3af;">
                Need help? Contact us at support@bittietasks.com
              </p>
            </div>
          </div>
        `,
        text: `
Welcome to BittieTasks!

Please verify your email address by clicking this link:
${verificationUrl}

This link expires in 24 hours.

If you didn't create an account with BittieTasks, you can safely ignore this email.

Need help? Contact us at support@bittietasks.com
        `
      })

      if (!emailResult.success) {
        console.error('Email sending failed:', emailResult.error)
        return { success: false, error: emailResult.error || 'Failed to send verification email' }
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error sending verification email:', error)
      return { success: false, error: error.message || 'Failed to send verification email' }
    }
  }

  // Verify token and mark user as verified
  async verifyEmail(token: string): Promise<{ success: boolean; message: string; redirectUrl?: string }> {
    try {
      // Find valid token
      const { data: tokenData, error: tokenError } = await supabase
        .from('verification_tokens')
        .select('*')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (tokenError || !tokenData) {
        return {
          success: false,
          message: 'Invalid or expired verification link. Please request a new verification email.'
        }
      }

      // Update user as verified in auth.users metadata
      // Only update if it's a real UUID (not test data)
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(tokenData.user_id)
      
      let updateError = null
      if (isValidUUID) {
        const result = await supabase.auth.admin.updateUserById(
          tokenData.user_id,
          {
            email_confirm: true,
            user_metadata: {
              email_verified: true,
              email_confirmed_at: new Date().toISOString()
            }
          }
        )
        updateError = result.error
      } else {
        console.log('Skipping user update for test user ID:', tokenData.user_id)
      }

      if (updateError) {
        console.error('Error updating user verification status:', updateError)
        return {
          success: false,
          message: 'Verification failed. Please try again or contact support.'
        }
      }

      // Delete used token
      await supabase
        .from('verification_tokens')
        .delete()
        .eq('token', token)

      return {
        success: true,
        message: 'Email verified successfully! You can now access all features.',
        redirectUrl: '/dashboard'
      }
    } catch (error) {
      console.error('Email verification error:', error)
      return {
        success: false,
        message: 'Verification failed due to a system error. Please try again.'
      }
    }
  }

  // Resend verification email
  async resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Find user by email
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
      
      if (userError) {
        console.error('Error finding user:', userError)
        return { success: false, error: 'Failed to find user account' }
      }

      const user = userData.users.find(u => u.email === email)
      if (!user) {
        console.error('User not found:', email)
        return { success: false, error: 'No account found with this email address' }
      }

      // Don't resend if already verified
      if (user.email_confirmed_at || user.user_metadata?.email_verified) {
        return { success: true } // Already verified
      }

      return await this.sendVerificationEmail(user.id, email)
    } catch (error: any) {
      console.error('Error resending verification email:', error)
      return { success: false, error: error.message || 'Failed to resend verification email' }
    }
  }
}

export const emailVerification = new EmailVerificationService()