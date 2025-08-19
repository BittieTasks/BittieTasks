import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

interface SubscriptionResult {
  success: boolean
  checkoutUrl?: string
  error?: string
  details?: any
}

interface SubscriptionPlan {
  planType: 'pro' | 'premium'
  price: number
  priceId: string
}

export class SubscriptionService {
  private stripe: Stripe | null = null
  private supabase

  constructor() {
    // Initialize Stripe only when needed (at runtime)
    if (process.env.STRIPE_SECRET_KEY) {
      try {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
        console.log('Stripe initialized with key:', process.env.STRIPE_SECRET_KEY.substring(0, 7) + '...')
      } catch (error: any) {
        console.error('Stripe initialization failed:', error.message)
      }
    } else {
      console.error('STRIPE_SECRET_KEY not found in environment')
    }
    
    // Use service role for database operations
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  private getStripe(): Stripe {
    if (!this.stripe) {
      const secretKey = process.env.STRIPE_SECRET_KEY
      if (!secretKey) {
        throw new Error('STRIPE_SECRET_KEY environment variable required')
      }
      console.log('Creating Stripe instance with key format:', secretKey.substring(0, 7) + '...')
      try {
        this.stripe = new Stripe(secretKey)
      } catch (error: any) {
        console.error('Stripe initialization error:', error.message)
        throw new Error(`Stripe initialization failed: ${error.message}`)
      }
    }
    return this.stripe
  }

  // Get subscription plans with Stripe price IDs
  getSubscriptionPlans(): Record<string, SubscriptionPlan> {
    const proPriceId = process.env.STRIPE_PRO_PRICE_ID
    const premiumPriceId = process.env.STRIPE_PREMIUM_PRICE_ID
    
    if (!proPriceId || !premiumPriceId) {
      console.error('Missing Stripe price IDs:', { 
        proPriceId: proPriceId ? 'set' : 'missing',
        premiumPriceId: premiumPriceId ? 'set' : 'missing'
      })
    }
    
    return {
      pro: {
        planType: 'pro',
        price: 9.99,
        priceId: proPriceId || 'price_1Rxbut2ZO7WvKXeTgo1nNSIE' // Fallback to known price ID
      },
      premium: {
        planType: 'premium', 
        price: 19.99,
        priceId: premiumPriceId || 'price_1Rxbxh2ZO7WvKXeTC6IoCqXD' // Fallback to known price ID
      }
    }
  }

  // Create or get Stripe customer
  async getOrCreateCustomer(user: any): Promise<{ success: boolean; customerId?: string; error?: string }> {
    try {
      // Check if user already has a Stripe customer ID  
      let customerId = user.stripeCustomerId
      
      if (customerId) {
        // Verify customer exists in Stripe
        try {
          await this.getStripe().customers.retrieve(customerId)
          return { success: true, customerId }
        } catch {
          // Customer doesn't exist, create new one
          customerId = null
        }
      }
      
      if (!customerId) {
        console.log('Creating new Stripe customer for email:', user.email)
        try {
          // Create new Stripe customer with detailed logging
          const customer = await this.getStripe().customers.create({
            email: user.email,
            metadata: { 
              supabase_user_id: user.id,
              created_from: 'bittietasks_subscription'
            }
          })
          
          console.log('Stripe customer created successfully:', customer.id)
          customerId = customer.id
          
          // Update user record with customer ID
          const updateResult = await this.supabase
            .from('users')
            .update({ 
              stripeCustomerId: customerId,
              updatedAt: new Date().toISOString()
            })
            .eq('id', user.id)
            
          if (updateResult.error) {
            console.error('Failed to update user with customer ID:', updateResult.error)
          } else {
            console.log('User updated with customer ID successfully')
          }
          
        } catch (stripeError: any) {
          console.error('Stripe customer creation failed:', {
            message: stripeError.message,
            type: stripeError.type,
            code: stripeError.code,
            statusCode: stripeError.statusCode,
            requestId: stripeError.requestId
          })
          
          // Check for specific Stripe error types
          if (stripeError.code === 'account_invalid' || stripeError.message?.includes('account')) {
            throw new Error('Stripe account not fully activated. Please complete account setup at https://dashboard.stripe.com/settings/account')
          } else if (stripeError.code === 'api_key_invalid') {
            throw new Error('Invalid Stripe API key. Please verify your secret key at https://dashboard.stripe.com/apikeys')
          } else if (stripeError.message?.includes('restricted') || stripeError.message?.includes('permission')) {
            throw new Error('API key permission error. Please use an unrestricted key from https://dashboard.stripe.com/apikeys')
          }
          
          throw stripeError
        }
      }
      
      return { success: true, customerId }
    } catch (error: any) {
      return { success: false, error: `Customer creation failed: ${error.message}` }
    }
  }

  // Create subscription checkout session
  async createCheckoutSession(
    user: any, 
    planType: 'pro' | 'premium'
  ): Promise<SubscriptionResult> {
    try {
      const plans = this.getSubscriptionPlans()
      const plan = plans[planType]
      
      console.log('Creating checkout session:', {
        planType,
        priceId: plan.priceId,
        userEmail: user.email,
        userId: user.id
      })
      
      if (!plan) {
        return { success: false, error: 'Invalid subscription plan' }
      }

      // Get or create Stripe customer
      const customerResult = await this.getOrCreateCustomer(user)
      if (!customerResult.success) {
        console.error('Customer creation failed:', customerResult.error)
        return { success: false, error: customerResult.error }
      }

      console.log('Stripe customer ready:', customerResult.customerId)

      // Create checkout session with enhanced error handling
      const sessionData = {
        customer: customerResult.customerId,
        payment_method_types: ['card'] as any,
        line_items: [{
          price: plan.priceId,
          quantity: 1,
        }],
        mode: 'subscription' as const,
        success_url: `https://bittietasks.com/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `https://bittietasks.com/subscribe?cancelled=true`,
        metadata: {
          user_id: user.id,
          plan_type: planType,
          user_email: user.email
        },
        allow_promotion_codes: true
      }

      console.log('Creating Stripe session with data:', sessionData)

      const session = await this.getStripe().checkout.sessions.create(sessionData)

      console.log('Stripe session created:', {
        sessionId: session.id,
        url: session.url,
        status: session.status
      })

      if (!session.url) {
        return { success: false, error: 'Failed to create checkout session - no URL returned' }
      }

      return { 
        success: true, 
        checkoutUrl: session.url,
        details: { sessionId: session.id, customerId: customerResult.customerId }
      }
    } catch (error: any) {
      console.error('Stripe session creation error:', {
        message: error.message,
        type: error.type,
        code: error.code,
        statusCode: error.statusCode
      })
      
      return { 
        success: false, 
        error: `Checkout session creation failed: ${error.message}`,
        details: { 
          originalError: error,
          stripeErrorType: error.type,
          stripeErrorCode: error.code 
        }
      }
    }
  }

  // Handle successful subscription (called by webhook)
  async handleSubscriptionSuccess(
    customerId: string, 
    subscriptionId: string,
    planType: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Find user by customer ID
      const { data: users, error: fetchError } = await this.supabase
        .from('users')
        .select('*')
        .eq('stripeCustomerId', customerId)
        .single()

      if (fetchError || !users) {
        return { success: false, error: 'User not found for customer ID' }
      }

      // Update user subscription status
      const updateData: any = {
        subscriptionStatus: 'active',
        subscriptionTier: planType,
        stripeSubscriptionId: subscriptionId,
        subscriptionStartDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Set subscription limits based on plan
      if (planType === 'pro') {
        updateData.monthlyTaskLimit = 100
        updateData.prioritySupport = true
      } else if (planType === 'premium') {
        updateData.monthlyTaskLimit = -1 // unlimited
        updateData.prioritySupport = true
        updateData.adFree = true
        updateData.premiumBadge = true
      } else if (planType === 'canceled') {
        updateData.subscriptionStatus = 'cancelled'
        updateData.subscriptionTier = 'free'
        updateData.monthlyTaskLimit = 5
        updateData.prioritySupport = false
        updateData.adFree = false
        updateData.premiumBadge = false
        updateData.subscriptionEndDate = new Date().toISOString()
      }

      const { error: updateError } = await this.supabase
        .from('users')
        .update(updateData)
        .eq('id', users.id)

      if (updateError) {
        return { success: false, error: `Database update failed: ${updateError.message}` }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: `Subscription handling failed: ${error.message}` }
    }
  }
}