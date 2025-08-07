// Escrow.com integration service for high-value transactions
export interface EscrowTransaction {
  id: string;
  amount: number;
  currency: string;
  buyerEmail: string;
  sellerEmail: string;
  description: string;
  inspectionPeriod: number; // days
  status: 'pending' | 'funded' | 'inspection' | 'completed' | 'disputed' | 'cancelled';
}

export interface EscrowPaymentRequest {
  amount: number;
  currency?: string;
  buyerEmail: string;
  sellerEmail: string;
  description: string;
  inspectionPeriod?: number;
  returnUrl?: string;
  cancelUrl?: string;
}

// Create escrow transaction using Escrow.com Pay API
export async function createEscrowTransaction(
  request: EscrowPaymentRequest
): Promise<{ paymentUrl: string; transactionId: string }> {
  // Check if Escrow.com API credentials are available
  if (!process.env.ESCROW_API_KEY || !process.env.ESCROW_EMAIL) {
    console.warn('Escrow.com API credentials not configured, using mock data');
    const mockTransactionId = `escrow_${Date.now()}`;
    const paymentUrl = `https://www.escrow.com/pay?transaction=${mockTransactionId}&amount=${request.amount}`;
    return { paymentUrl, transactionId: mockTransactionId };
  }
  
  try {
    const response = await fetch('https://api.escrow.com/2017-09-01/transaction', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ESCROW_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parties: [
          { role: 'buyer', email: request.buyerEmail },
          { role: 'seller', email: request.sellerEmail }
        ],
        items: [{
          title: request.description,
          description: request.description,
          type: 'general_merchandise',
          inspection_period: request.inspectionPeriod || 3,
          quantity: 1,
          schedule: [{
            amount: request.amount,
            payer_customer: 'buyer',
            beneficiary_customer: 'seller'
          }]
        }],
        currency: request.currency || 'USD'
      })
    });

    if (!response.ok) {
      throw new Error(`Escrow API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      paymentUrl: data.payment_url,
      transactionId: data.id
    };
  } catch (error) {
    console.error('Escrow.com API error:', error);
    // Fallback to Stripe for failed escrow transactions
    throw new Error('High-value transaction processing temporarily unavailable');
  }
}

// Check escrow transaction status  
export async function getEscrowTransactionStatus(
  transactionId: string
): Promise<EscrowTransaction | null> {
  if (!process.env.ESCROW_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(`https://api.escrow.com/2017-09-01/transaction/${transactionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.ESCROW_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return {
      id: data.id,
      amount: data.items[0]?.schedule[0]?.amount || 0,
      currency: data.currency,
      buyerEmail: data.parties.find((p: any) => p.role === 'buyer')?.email || '',
      sellerEmail: data.parties.find((p: any) => p.role === 'seller')?.email || '',
      description: data.items[0]?.title || '',
      inspectionPeriod: data.items[0]?.inspection_period || 3,
      status: data.status as any
    };
  } catch (error) {
    console.error('Error fetching escrow status:', error);
    return null;
  }
}

// Determine if a transaction should use escrow based on amount and risk factors
export function shouldUseEscrow(
  amount: number,
  isNewUser: boolean,
  isHighRiskCategory: boolean
): boolean {
  // Use escrow for:
  // - High value transactions ($100+)
  // - New users on either side
  // - High-risk categories (home improvement, expensive services)
  
  if (amount >= 100) return true;
  if (isNewUser && amount >= 50) return true;
  if (isHighRiskCategory && amount >= 25) return true;
  
  return false;
}

// Generate escrow payment button HTML for easy integration
export function generateEscrowPaymentButton(
  amount: number,
  description: string,
  buyerEmail: string,
  sellerEmail: string
): string {
  return `
    <form action="https://www.escrow.com/pay" method="post" target="_blank">
      <input type="hidden" name="amount" value="${amount.toFixed(2)}">
      <input type="hidden" name="description" value="${description}">
      <input type="hidden" name="buyer_email" value="${buyerEmail}">
      <input type="hidden" name="seller_email" value="${sellerEmail}">
      <input type="hidden" name="inspection_period" value="3">
      <input type="submit" value="Pay Securely with Escrow" 
             class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
    </form>
  `;
}

// Calculate escrow fees (Escrow.com charges 0.89% - 3.25%)
export function calculateEscrowFee(amount: number): number {
  // Escrow.com fee structure (approximate)
  if (amount >= 5000) return amount * 0.0089; // 0.89% for high amounts
  if (amount >= 1000) return amount * 0.0195; // 1.95% for medium amounts
  return amount * 0.0325; // 3.25% for smaller amounts
}

// Validate escrow transaction data
export function validateEscrowRequest(request: EscrowPaymentRequest): string[] {
  const errors: string[] = [];
  
  if (request.amount < 10) {
    errors.push('Minimum escrow amount is $10');
  }
  
  if (request.amount > 500000) {
    errors.push('Maximum escrow amount is $500,000');
  }
  
  if (!request.buyerEmail || !request.buyerEmail.includes('@')) {
    errors.push('Valid buyer email is required');
  }
  
  if (!request.sellerEmail || !request.sellerEmail.includes('@')) {
    errors.push('Valid seller email is required');
  }
  
  if (!request.description || request.description.length < 10) {
    errors.push('Description must be at least 10 characters');
  }
  
  return errors;
}