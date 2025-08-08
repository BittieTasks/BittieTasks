interface PayPalOrder {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

interface PayPalPaymentResult {
  success: boolean;
  order?: PayPalOrder;
  error?: string;
  approvalUrl?: string;
}

class PayPalService {
  private clientId: string | null = null;
  private clientSecret: string | null = null;
  private isConfigured: boolean = false;
  private baseUrl: string = 'https://api-m.sandbox.paypal.com'; // Use sandbox for development

  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID || null;
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || null;
    this.isConfigured = !!(this.clientId && this.clientSecret);
    
    if (this.isConfigured) {
      console.log('✓ PayPal service initialized successfully');
    } else {
      console.warn('PayPal not configured. PayPal payments disabled.');
    }
  }

  async getAccessToken(): Promise<string | null> {
    if (!this.isConfigured) {
      return null;
    }

    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('PayPal access token error:', error);
      return null;
    }
  }

  async createOrder(amount: number, currency: string = 'USD'): Promise<PayPalPaymentResult> {
    if (!this.isConfigured) {
      return {
        success: false,
        error: 'PayPal not configured'
      };
    }

    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return {
          success: false,
          error: 'Failed to get PayPal access token'
        };
      }

      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amount.toFixed(2)
          }
        }],
        application_context: {
          return_url: `${process.env.APP_URL || 'http://localhost:5000'}/payment/paypal/success`,
          cancel_url: `${process.env.APP_URL || 'http://localhost:5000'}/payment/paypal/cancel`
        }
      };

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const order = await response.json();

      if (response.ok) {
        const approvalUrl = order.links?.find((link: any) => link.rel === 'approve')?.href;
        
        return {
          success: true,
          order,
          approvalUrl
        };
      } else {
        return {
          success: false,
          error: order.message || 'Failed to create PayPal order'
        };
      }
    } catch (error: any) {
      console.error('PayPal order creation error:', error);
      return {
        success: false,
        error: error.message || 'PayPal service error'
      };
    }
  }

  async captureOrder(orderId: string): Promise<PayPalPaymentResult> {
    if (!this.isConfigured) {
      return {
        success: false,
        error: 'PayPal not configured'
      };
    }

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
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const order = await response.json();

      if (response.ok) {
        return {
          success: true,
          order
        };
      } else {
        return {
          success: false,
          error: order.message || 'Failed to capture PayPal order'
        };
      }
    } catch (error: any) {
      console.error('PayPal order capture error:', error);
      return {
        success: false,
        error: error.message || 'PayPal service error'
      };
    }
  }

  async getOrderDetails(orderId: string): Promise<PayPalPaymentResult> {
    if (!this.isConfigured) {
      return {
        success: false,
        error: 'PayPal not configured'
      };
    }

    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return {
          success: false,
          error: 'Failed to get PayPal access token'
        };
      }

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const order = await response.json();

      if (response.ok) {
        return {
          success: true,
          order
        };
      } else {
        return {
          success: false,
          error: order.message || 'Failed to get PayPal order details'
        };
      }
    } catch (error: any) {
      console.error('PayPal order details error:', error);
      return {
        success: false,
        error: error.message || 'PayPal service error'
      };
    }
  }

  isEnabled(): boolean {
    return this.isConfigured;
  }
}

export const paypalService = new PayPalService();
export default paypalService;