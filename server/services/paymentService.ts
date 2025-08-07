import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: string;
}

class PaymentService {
  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<PaymentResult> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      console.log(`Payment intent created: ${paymentIntent.id} for $${amount}`);

      return {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          client_secret: paymentIntent.client_secret!,
        }
      };
    } catch (error: any) {
      console.error('Payment intent creation failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<{ success: boolean; status?: string; error?: string }> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        success: true,
        status: paymentIntent.status
      };
    } catch (error: any) {
      console.error('Payment confirmation failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createConnectedAccount(email: string, country: string = 'US'): Promise<{ success: boolean; accountId?: string; error?: string }> {
    try {
      const account = await stripe.accounts.create({
        type: 'express',
        email,
        country,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      return {
        success: true,
        accountId: account.id
      };
    } catch (error: any) {
      console.error('Connected account creation failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async processPlatformPayment(
    amount: number,
    platformFee: number,
    connectedAccountId: string
  ): Promise<PaymentResult> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        application_fee_amount: Math.round(platformFee * 100),
        transfer_data: {
          destination: connectedAccountId,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      console.log(`Platform payment created: ${paymentIntent.id}, Fee: $${platformFee}`);

      return {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          client_secret: paymentIntent.client_secret!,
        }
      };
    } catch (error: any) {
      console.error('Platform payment failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  isEnabled(): boolean {
    return !!process.env.STRIPE_SECRET_KEY;
  }
}

export const paymentService = new PaymentService();
export default paymentService;