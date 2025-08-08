import { Router } from "express";
import { z } from "zod";
import { paymentService } from "../services/paymentService";
import { escrowService } from "../services/escrowService";
import { paypalService } from "../services/paypalService";
import { storage } from "../supabase-storage";

const router = Router();

// Schema for payment intent creation
const createPaymentIntentSchema = z.object({
  taskCompletionId: z.string(),
  amount: z.number().min(1),
  useEscrow: z.boolean().optional()
});

// Schema for subscription creation
const createSubscriptionSchema = z.object({
  priceId: z.string(),
  tier: z.enum(['pro', 'premium'])
});

// Create payment intent for task completion
router.post("/create-payment-intent", async (req, res) => {
  try {
    if (!paymentService.isEnabled()) {
      return res.status(503).json({ 
        error: "Payment processing is currently unavailable. Please try again later." 
      });
    }

    const { amount, taskCompletionId, useEscrow } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Helper function to determine if escrow should be used
    const shouldUseEscrowPayment = (amount: number, isProviderUnverified: boolean, isHighRiskCategory: boolean) => {
      return amount >= 100 || isProviderUnverified || isHighRiskCategory;
    };

    // Helper function to calculate escrow fee
    const calculateEscrowFee = (amount: number) => {
      return Math.max(15, amount * 0.025); // $15 minimum or 2.5% of amount
    };

    if (taskCompletionId) {
      const taskCompletion = await storage.getTaskCompletion(taskCompletionId);
      if (!taskCompletion) {
        return res.status(404).json({ error: "Task completion not found" });
      }

      // Get task and user details
      const task = await storage.getTask(taskCompletion.taskId);
      const provider = await storage.getUser(taskCompletion.userId);
      
      if (!task || !provider) {
        return res.status(404).json({ error: "Task or provider information incomplete" });
      }

      // Determine if escrow should be used
      const shouldUseEscrowForTask = useEscrow || shouldUseEscrowPayment(
        amount,
        !provider.isIdentityVerified,
        task.categoryId === 'home-improvement'
      );

      if (shouldUseEscrowForTask && escrowService.isEnabled()) {
        // Use Escrow.com for high-value/risk transactions
        const escrowFee = calculateEscrowFee(amount);
        const totalAmount = amount + escrowFee;
        
        res.json({
          useEscrow: true,
          amount: totalAmount,
          escrowFee,
          paymentUrl: `https://www.escrow.com/pay?amount=${amount}&description=${encodeURIComponent(task.title)}`
        });
        return;
      }
    }

    // Use Stripe for standard transactions
    const result = await paymentService.createPaymentIntent(amount, 'usd', {
      taskCompletionId: taskCompletionId || null
    });
    
    if (result.success && result.paymentIntent) {
      res.json({
        clientSecret: result.paymentIntent.client_secret,
        paymentIntentId: result.paymentIntent.id,
        amount: result.paymentIntent.amount,
        useEscrow: false
      });
    } else {
      res.status(500).json({ error: result.error || 'Failed to create payment intent' });
    }
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

// Create subscription for Pro/Premium plans
router.post("/create-subscription", async (req, res) => {
  try {
    if (!paymentService.isEnabled()) {
      return res.status(503).json({ 
        error: "Subscription billing is currently unavailable. Please try again later." 
      });
    }

    // Check if user is authenticated
    if (!(req.session as any)?.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { priceId, tier } = createSubscriptionSchema.parse(req.body);
    const userId = (req.session as any).userId;

    // Get user details
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customerResult = await paymentService.createCustomer(
        user.email,
        `${user.firstName} ${user.lastName}`,
        { userId: user.id }
      );
      
      if (!customerResult.success || !customerResult.customer) {
        return res.status(500).json({ error: "Failed to create customer" });
      }
      
      customerId = customerResult.customer.id;
      
      // Update user with Stripe customer ID
      await storage.updateUser(userId, { stripeCustomerId: customerId });
    }

    // Create subscription
    const subscriptionResult = await paymentService.createSubscription(
      customerId,
      priceId,
      { userId, tier }
    );

    if (!subscriptionResult.success || !subscriptionResult.subscription) {
      return res.status(500).json({ error: subscriptionResult.error || "Failed to create subscription" });
    }

    const subscription = subscriptionResult.subscription;

    // Update user subscription info
    await storage.updateUser(userId, {
      subscriptionTier: tier,
      subscriptionStatus: 'active',
      stripeSubscriptionId: subscription.id,
      subscriptionStartDate: new Date(),
      monthlyTaskLimit: tier === 'pro' ? 50 : 200, // Pro: 50, Premium: 200
      prioritySupport: true,
      adFree: true,
      premiumBadge: tier === 'premium'
    });

    const latestInvoice = subscription.latest_invoice as any;
    res.json({
      subscriptionId: subscription.id,
      clientSecret: latestInvoice?.payment_intent?.client_secret,
      status: subscription.status
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ error: "Failed to create subscription" });
  }
});

// Get subscription status
router.get("/subscription-status", async (req, res) => {
  try {
    if (!(req.session as any)?.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await storage.getUser((req.session as any).userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      tier: user.subscriptionTier,
      status: user.subscriptionStatus,
      monthlyTaskLimit: user.monthlyTaskLimit,
      monthlyTasksCompleted: user.monthlyTasksCompleted,
      prioritySupport: user.prioritySupport,
      adFree: user.adFree,
      premiumBadge: user.premiumBadge
    });
  } catch (error) {
    console.error("Error getting subscription status:", error);
    res.status(500).json({ error: "Failed to get subscription status" });
  }
});

// Cancel subscription
router.post("/cancel-subscription", async (req, res) => {
  try {
    if (!paymentService.isEnabled()) {
      return res.status(503).json({ 
        error: "Subscription management is currently unavailable." 
      });
    }

    if (!(req.session as any)?.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await storage.getUser((req.session as any).userId);
    if (!user || !user.stripeSubscriptionId) {
      return res.status(404).json({ error: "No active subscription found" });
    }

    // Cancel subscription at period end
    const cancelResult = await paymentService.cancelSubscription(
      user.stripeSubscriptionId,
      true
    );

    if (!cancelResult.success) {
      return res.status(500).json({ error: cancelResult.error || "Failed to cancel subscription" });
    }

    // Update user subscription status
    await storage.updateUser((req.session as any).userId, {
      subscriptionStatus: 'cancelled'
    });

    res.json({
      message: "Subscription cancelled successfully",
      endsAt: (cancelResult.subscription as any)?.current_period_end
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

// Stripe webhook handler
router.post("/webhook", async (req, res) => {
  try {
    if (!paymentService.isEnabled()) {
      return res.status(503).send("Webhooks unavailable");
    }

    const signature = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return res.status(500).send("Webhook secret not configured");
    }

    const event = paymentService.verifyWebhookSignature(req.body, signature, webhookSecret);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as any;
        console.log(`Payment succeeded: ${paymentIntent.id}`);
        // Update task completion payment status
        break;
        
      case 'invoice.payment_succeeded':
        const invoice = event.data.object as any;
        console.log(`Subscription payment succeeded: ${invoice.subscription}`);
        // Ensure subscription is active
        break;
        
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as any;
        console.log(`Subscription payment failed: ${failedInvoice.subscription}`);
        // Handle payment failure
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({ error: "Webhook processing failed" });
  }
});

// Get payment methods for user
router.get("/payment-methods", async (req, res) => {
  try {
    if (!paymentService.isEnabled()) {
      return res.status(503).json({ 
        error: "Payment method management is currently unavailable." 
      });
    }

    if (!(req.session as any)?.userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await storage.getUser((req.session as any).userId);
    if (!user || !user.stripeCustomerId) {
      return res.json({ paymentMethods: [] });
    }

    res.json({ 
      paymentMethods: [],
      stripeEnabled: paymentService.isEnabled(),
      escrowEnabled: escrowService.isEnabled(),
      paypalEnabled: false, // Will be enabled when PayPal is configured
      message: paymentService.isEnabled() ? "Stripe payments available" : "Payment methods will be available once Stripe is configured"
    });
  } catch (error) {
    console.error("Error getting payment methods:", error);
    res.status(500).json({ error: "Failed to get payment methods" });
  }
});

// PayPal payment routes
router.post("/create-paypal-order", async (req, res) => {
  try {
    if (!paypalService.isEnabled()) {
      return res.status(503).json({ 
        error: "PayPal payments are currently unavailable. Please try another method." 
      });
    }

    const { amount, taskId } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const result = await paypalService.createOrder(amount, 'USD');
    
    if (result.success && result.order) {
      res.json({
        success: true,
        orderId: result.order.id,
        approvalUrl: result.approvalUrl
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: result.error || 'Failed to create PayPal order' 
      });
    }
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    res.status(500).json({ error: "Failed to create PayPal order" });
  }
});

// PayPal order capture
router.post("/capture-paypal-order", async (req, res) => {
  try {
    if (!paypalService.isEnabled()) {
      return res.status(503).json({ 
        error: "PayPal payments are currently unavailable." 
      });
    }

    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const result = await paypalService.captureOrder(orderId);
    
    if (result.success && result.order) {
      res.json({
        success: true,
        order: result.order
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: result.error || 'Failed to capture PayPal order' 
      });
    }
  } catch (error) {
    console.error("Error capturing PayPal order:", error);
    res.status(500).json({ error: "Failed to capture PayPal order" });
  }
});

// PayPal success callback
router.get("/paypal/success", async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.redirect('/payment/error?message=Missing payment token');
    }

    const result = await paypalService.getOrderDetails(token as string);
    
    if (result.success && result.order?.status === 'APPROVED') {
      // Capture the payment
      const captureResult = await paypalService.captureOrder(token as string);
      
      if (captureResult.success) {
        res.redirect('/payment/success');
      } else {
        res.redirect('/payment/error?message=Payment capture failed');
      }
    } else {
      res.redirect('/payment/error?message=Payment not approved');
    }
  } catch (error) {
    console.error("PayPal success callback error:", error);
    res.redirect('/payment/error?message=Payment processing error');
  }
});

// PayPal cancel callback
router.get("/paypal/cancel", (req, res) => {
  res.redirect('/payment/cancelled');
});

export default router;