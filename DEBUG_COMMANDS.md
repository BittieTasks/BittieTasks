# Debug Commands for Stripe Issue

## Run these commands to debug:

### 1. Check Environment Variables
```bash
curl -s 'https://www.bittietasks.com/api/check-env-vars'
```

### 2. Test Stripe Key Validation
```bash
curl -s 'https://www.bittietasks.com/api/stripe-validate'
```

### 3. Test Mode Status
```bash
curl -s 'https://www.bittietasks.com/api/test-mode-setup'
```

### 4. Debug Test Keys
```bash
curl -s 'https://www.bittietasks.com/api/debug-test-keys'
```

## Expected Results:

### If Working Correctly:
- `secret_key.is_secret: true`
- `secret_key.is_test: true` 
- `public_key.is_test: true`
- `diagnosis.secret_key_valid: true`

### If Still Broken:
- `secret_key.is_secret: false` (means publishable key in wrong place)
- `keys_match_environment: false` (means mismatched test/live keys)

## Browser Test:
1. Go to: https://www.bittietasks.com/subscribe
2. Open browser console (F12)
3. Click subscription button
4. Look for "=== STRIPE KEY DEBUG ===" messages

This will show exactly what key the server is receiving and why the publishable key error is happening.