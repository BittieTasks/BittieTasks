# Stripe Webhook Configuration

## Required Setup After Deployment

Once your site is live at https://bittietasks.com, you need to configure the Stripe webhook:

### Step 1: Add Webhook Endpoint in Stripe
1. Go to https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. **Endpoint URL**: `https://bittietasks.com/api/webhooks/stripe`
4. **Events to send**: Select these events:
   - `checkout.session.completed`
   - `customer.subscription.updated` 
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

### Step 2: Get Webhook Secret
1. After creating the webhook, click on it
2. Copy the **Signing secret** (starts with `whsec_`)
3. Add it to your environment variables as `STRIPE_WEBHOOK_SECRET`

### Step 3: Test the Flow
1. Go to https://bittietasks.com/subscribe
2. Click subscribe on Pro or Premium plan  
3. Complete payment with test card: `4242424242424242`
4. Verify successful redirect and database update

## System Design
- **Clean Authentication**: Proper JWT validation
- **Stripe Integration**: Complete payment processing 
- **Database Updates**: Automatic subscription management
- **Error Handling**: Comprehensive logging and user feedback

Ready to test the complete subscription flow!