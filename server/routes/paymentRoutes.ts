import { Router } from 'express';
import paymentService from '../services/paymentService';
import escrowService from '../services/escrowService';
import { paypalService } from '../services/paypalService';

const router = Router();

// Create payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const result = await paymentService.createPaymentIntent(amount, currency);
    
    if (result.success && result.paymentIntent) {
      res.json({
        clientSecret: result.paymentIntent.client_secret,
        paymentIntentId: result.paymentIntent.id,
        amount: result.paymentIntent.amount
      });
    } else {
      res.status(500).json({
        error: result.error || 'Failed to create payment intent'
      });
    }
  } catch (error: any) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Create escrow transaction for high-value payments
router.post('/create-escrow', async (req, res) => {
  try {
    const { amount, buyerEmail, sellerEmail, description } = req.body;
    
    if (!amount || !buyerEmail || !sellerEmail) {
      return res.status(400).json({ 
        error: 'Amount, buyer email, and seller email are required' 
      });
    }

    if (amount < escrowService.getMinimumAmount()) {
      return res.status(400).json({
        error: `Escrow protection requires minimum amount of $${escrowService.getMinimumAmount()}`
      });
    }

    const result = await escrowService.createEscrowTransaction(
      amount,
      buyerEmail,
      sellerEmail,
      description || 'BittieTasks transaction'
    );
    
    if (result.success) {
      res.json({
        success: true,
        transactionId: result.transactionId,
        message: 'Escrow transaction created successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('Escrow transaction error:', error);
    res.status(500).json({ error: 'Failed to create escrow transaction' });
  }
});

// Get payment service status
router.get('/status', (req, res) => {
  res.json({
    stripe: {
      enabled: paymentService.isEnabled(),
      features: ['payment_intents', 'connected_accounts', 'platform_payments']
    },
    escrow: {
      enabled: escrowService.isEnabled(),
      minimumAmount: escrowService.getMinimumAmount(),
      features: ['high_value_protection', 'buyer_seller_protection']
    },
    paypal: {
      enabled: paypalService.isEnabled(),
      features: ['instant_payment', 'buyer_protection', 'express_checkout']
    }
  });
});

// Confirm payment
router.post('/confirm/:paymentIntentId', async (req, res) => {
  try {
    const { paymentIntentId } = req.params;
    
    const result = await paymentService.confirmPayment(paymentIntentId);
    
    if (result.success) {
      res.json({
        success: true,
        status: result.status
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Create connected account for task creators
router.post('/create-account', async (req, res) => {
  try {
    const { email, country = 'US' } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await paymentService.createConnectedAccount(email, country);
    
    if (result.success) {
      res.json({
        success: true,
        accountId: result.accountId
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('Connected account creation error:', error);
    res.status(500).json({ error: 'Failed to create connected account' });
  }
});

export default router;