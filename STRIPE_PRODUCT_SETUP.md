# Creating Stripe Products for BittieTasks

## Quick Setup Instructions

### 1. Go to Stripe Products
Visit: https://dashboard.stripe.com/products

### 2. Ensure Test Mode
- Toggle should show "Test data" (top-left)
- This matches your test Stripe keys

### 3. Create Pro Plan Product
Click "Add product" and fill in:

**Product Information:**
- Name: `BittieTasks Pro Plan`
- Description: `Pro subscription for BittieTasks - Enhanced task features and priority support`

**Pricing:**
- Pricing model: `Recurring`
- Price: `$9.99`
- Billing period: `Monthly`
- Currency: `USD`

Click "Save product"

### 4. Create Premium Plan Product  
Click "Add product" again:

**Product Information:**
- Name: `BittieTasks Premium Plan`  
- Description: `Premium subscription for BittieTasks - All features plus advanced analytics and unlimited tasks`

**Pricing:**
- Pricing model: `Recurring`
- Price: `$19.99` 
- Billing period: `Monthly`
- Currency: `USD`

Click "Save product"

### 5. Copy the Price IDs
After creating each product:
- Click on the product name
- In the "Pricing" section, copy the Price ID
- It looks like: `price_1234567890abcdef`

**Pro Plan Price ID:** `price_xxxxxxxxxxxxxxxxx`
**Premium Plan Price ID:** `price_xxxxxxxxxxxxxxxxx`

### 6. Add to Environment Variables
Add these to your `.env.local` file:

```bash
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxxxxxx
STRIPE_PREMIUM_PRICE_ID=price_xxxxxxxxxxxxxxxxx
```

## Verification
After setup, you can test the subscription flow:
1. Go to your app's pricing page
2. Click "Subscribe to Pro"  
3. Should redirect to Stripe checkout with $9.99/month
4. Use test card: `4242 4242 4242 4242`
5. Complete test purchase

## Note for Going Live
When you switch to live Stripe keys:
1. Create the same products in LIVE mode
2. Copy the LIVE price IDs  
3. Update environment variables with live price IDs