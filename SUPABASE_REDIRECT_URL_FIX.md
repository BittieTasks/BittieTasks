# Supabase Redirect URL Configuration Fix

## ✅ ISSUE IDENTIFIED: Wrong Redirect URL in Supabase

**Problem**: Supabase redirect URLs are set to `localhost:19006` instead of `localhost:5000`

## Required Supabase Configuration Changes:

### 1. Update Site URL
- **Go to**: Supabase Dashboard → Settings → Authentication
- **Find**: Site URL
- **Change from**: `http://localhost:19006`
- **Change to**: `http://localhost:5000`

### 2. Update Redirect URLs
- **Go to**: Supabase Dashboard → Settings → Authentication → URL Configuration
- **Find**: Redirect URLs list
- **Remove**: `http://localhost:19006/**`
- **Add**: `http://localhost:5000/**`

### 3. Additional URLs to Configure:
```
Site URL: http://localhost:5000
Redirect URLs:
- http://localhost:5000/**
- http://localhost:5000/verify-email
- http://localhost:5000/auth/callback
```

## Step-by-Step Instructions:

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: BittieTasks (ttgbotlcbzmmyqawnjpj)
3. **Go to**: Settings (left sidebar) → Authentication
4. **Scroll to**: URL Configuration section
5. **Update Site URL**: Change to `http://localhost:5000`
6. **Update Redirect URLs**: 
   - Remove any `localhost:19006` entries
   - Add `http://localhost:5000/**`
7. **Save changes**

## Why This Matters:

- Verification emails use Supabase's configured redirect URLs
- Links in emails automatically redirect to the configured site URL
- Wrong URL = "site can't be reached" error

## After Making Changes:

1. **Send new verification email** (old tokens will still use wrong URL)
2. **Test verification link** - should work correctly
3. **All future emails** will use correct localhost:5000 URL

The verification system will work properly once these Supabase settings are updated.