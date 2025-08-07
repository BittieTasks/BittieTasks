// PayPal Integration Service for BittieTasks
// Provides alternative payment methods for users without credit cards

interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'production';
}

interface PayPalPayment {
  amount: number;
  currency: string;
  description: string;
  userId: string;
  orderId?: string;
}

interface PayPalWebhookEvent {
  event_type: string;
  resource: any;
  summary: string;
}

class PayPalIntegrationService {
  private config: PayPalConfig;
  private baseUrl: string;

  constructor() {
    this.config = {
      clientId: process.env.PAYPAL_CLIENT_ID || '',
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
      environment: (process.env.NODE_ENV === 'production' ? 'production' : 'sandbox') as 'sandbox' | 'production'
    };
    
    this.baseUrl = this.config.environment === 'production' 
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  async createPayment(payment: PayPalPayment): Promise<{ success: boolean; approvalUrl?: string; orderId?: string; error?: string }> {
    try {
      if (!this.config.clientId || !this.config.clientSecret) {
        return {
          success: false,
          error: 'PayPal credentials not configured'
        };
      }

      // Get access token
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return {
          success: false,
          error: 'Failed to get PayPal access token'
        };
      }

      // Create order
      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: payment.currency,
            value: payment.amount.toFixed(2)
          },
          description: payment.description
        }],
        payment_source: {
          paypal: {
            experience_context: {
              payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
              brand_name: 'BittieTasks',
              shipping_preference: 'NO_SHIPPING',
              user_action: 'PAY_NOW',
              return_url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/paypal/success`,
              cancel_url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/paypal/cancel`
            }
          }
        }
      };

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': `${payment.userId}-${Date.now()}`
        },
        body: JSON.stringify(orderData)
      });

      const orderResult = await response.json();

      if (response.ok && orderResult.id) {
        const approvalUrl = orderResult.links?.find((link: any) => link.rel === 'approve')?.href;
        
        return {
          success: true,
          orderId: orderResult.id,
          approvalUrl
        };
      } else {
        return {
          success: false,
          error: `PayPal API error: ${orderResult.message || 'Unknown error'}`
        };
      }
    } catch (error: any) {
      console.error('PayPal payment creation error:', error);
      return {
        success: false,
        error: error.message || 'Payment creation failed'
      };
    }
  }

  async capturePayment(orderId: string): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return {
          success: false,
          error: 'Failed to get PayPal access token'
        };
      }

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const result = await response.json();

      if (response.ok && result.status === 'COMPLETED') {
        const transactionId = result.purchase_units?.[0]?.payments?.captures?.[0]?.id;
        
        return {
          success: true,
          transactionId
        };
      } else {
        return {
          success: false,
          error: `Capture failed: ${result.message || 'Unknown error'}`
        };
      }
    } catch (error: any) {
      console.error('PayPal capture error:', error);
      return {
        success: false,
        error: error.message || 'Payment capture failed'
      };
    }
  }

  async handleWebhook(webhookEvent: PayPalWebhookEvent): Promise<void> {
    try {
      console.log(`📨 PayPal Webhook: ${webhookEvent.event_type}`);

      switch (webhookEvent.event_type) {
        case 'CHECKOUT.ORDER.APPROVED':
          console.log('✅ PayPal order approved:', webhookEvent.resource.id);
          // Handle order approval
          break;

        case 'PAYMENT.CAPTURE.COMPLETED':
          console.log('💰 PayPal payment captured:', webhookEvent.resource.id);
          // Handle successful payment
          break;

        case 'PAYMENT.CAPTURE.DENIED':
          console.log('❌ PayPal payment denied:', webhookEvent.resource.id);
          // Handle payment denial
          break;

        case 'BILLING.SUBSCRIPTION.CREATED':
          console.log('📝 PayPal subscription created:', webhookEvent.resource.id);
          // Handle subscription creation
          break;

        case 'BILLING.SUBSCRIPTION.CANCELLED':
          console.log('🔄 PayPal subscription cancelled:', webhookEvent.resource.id);
          // Handle subscription cancellation
          break;

        default:
          console.log(`ℹ️  Unhandled PayPal webhook: ${webhookEvent.event_type}`);
      }
    } catch (error) {
      console.error('PayPal webhook handling error:', error);
    }
  }

  async createSubscription(planId: string, userId: string): Promise<{ success: boolean; subscriptionId?: string; approvalUrl?: string; error?: string }> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return {
          success: false,
          error: 'Failed to get PayPal access token'
        };
      }

      const subscriptionData = {
        plan_id: planId,
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Start tomorrow
        quantity: 1,
        shipping_amount: {
          currency_code: 'USD',
          value: '0.00'
        },
        subscriber: {
          name: {
            given_name: 'User',
            surname: userId
          }
        },
        application_context: {
          brand_name: 'BittieTasks',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          payment_method: {
            payer_selected: 'PAYPAL',
            payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
          },
          return_url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/paypal/subscription/success`,
          cancel_url: `${process.env.BASE_URL || 'http://localhost:5000'}/api/paypal/subscription/cancel`
        }
      };

      const response = await fetch(`${this.baseUrl}/v1/billing/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': `${userId}-sub-${Date.now()}`
        },
        body: JSON.stringify(subscriptionData)
      });

      const result = await response.json();

      if (response.ok && result.id) {
        const approvalUrl = result.links?.find((link: any) => link.rel === 'approve')?.href;
        
        return {
          success: true,
          subscriptionId: result.id,
          approvalUrl
        };
      } else {
        return {
          success: false,
          error: `Subscription creation failed: ${result.message || 'Unknown error'}`
        };
      }
    } catch (error: any) {
      console.error('PayPal subscription creation error:', error);
      return {
        success: false,
        error: error.message || 'Subscription creation failed'
      };
    }
  }

  private async getAccessToken(): Promise<string | null> {
    try {
      const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');
      
      const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });

      const result = await response.json();
      return response.ok ? result.access_token : null;
    } catch (error) {
      console.error('PayPal access token error:', error);
      return null;
    }
  }

  isConfigured(): boolean {
    return !!(this.config.clientId && this.config.clientSecret);
  }

  getEnvironment(): string {
    return this.config.environment;
  }
}

export const paypalIntegration = new PayPalIntegrationService();