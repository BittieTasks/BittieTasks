# Stripe Test Mode Troubleshooting

## COMMON TEST SETUP ISSUES:

### 1. **Key Mismatch**
- Public key must be `pk_test_xxxxx`  
- Secret key must be `sk_test_xxxxx`
- Both need to be from the SAME Stripe account

### 2. **Wrong Price IDs**
- Must be from TEST dashboard products
- Should start with `price_` followed by test characters
- Create new test products if needed

### 3. **Test Products Missing**
In https://dashboard.stripe.com/test/products:
- Create "Pro Plan" → $9.99/month → Copy price ID
- Create "Premium Plan" → $19.99/month → Copy price ID

### 4. **Vercel Environment Variables**
Double-check these are updated correctly:
```
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PRO_PRICE_ID=price_test_xxxxx  
STRIPE_PREMIUM_PRICE_ID=price_test_xxxxx
```

## QUICK FIXES:

### **Option 1: Start Fresh**
1. Go to https://dashboard.stripe.com/test/products
2. Delete any existing test products
3. Create new "Pro Plan" and "Premium Plan"
4. Copy the new price IDs
5. Update Vercel environment variables

### **Option 2: Use My Test Setup**
I can provide working test price IDs from a test account if you want to skip the product creation.

## SHARE THE ERROR:
Copy the exact error message from browser console - that will tell me exactly what's wrong and how to fix it instantly.

The error message will show whether it's:
- API key issue
- Price ID issue  
- Account configuration issue
- Or something else entirely