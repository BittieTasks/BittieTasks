# Where to Find Unverified Email Users

## Option 1: Supabase Dashboard (Easiest)

### Steps:
1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your BittieTasks project**
3. **Navigate to Authentication** → **Users**
4. **Look for users with**:
   - `email_confirmed_at`: null or empty
   - `Email Verified`: No/False status

### What you'll see:
- List of all users with verification status
- Email addresses that haven't been verified
- Creation timestamps
- Last sign-in attempts

## Option 2: Admin API Endpoint

Your app has an admin endpoint to check unverified users:

```bash
# Check unverified users via API
curl http://localhost:5000/api/auth/unconfirmed-users
```

This returns users who:
- Have accounts created
- Haven't verified their email addresses yet
- May need verification emails resent

## Option 3: Database Query (Advanced)

If you have direct database access:

```sql
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users 
WHERE email_confirmed_at IS NULL
ORDER BY created_at DESC;
```

## Common Scenarios

### User Says "I Never Got the Email"
1. Check if they're in the unverified users list
2. Check their spam/junk folder
3. Resend verification email via admin panel
4. Verify SendGrid delivery logs

### User Created Account But Can't Access
- They're likely in unverified status
- Check Supabase Auth → Users for their email
- Their `email_confirmed_at` will be null
- Send new verification email

## Email Verification Status Meanings

- **email_confirmed_at: null** = Email not verified
- **email_confirmed_at: [timestamp]** = Email verified
- **last_sign_in_at: null** = Never successfully signed in
- **created_at: recent** = Just signed up, waiting for verification

## Quick Actions

### To Manually Verify a User (Admin Only):
1. Go to Supabase Dashboard
2. Authentication → Users  
3. Find the user
4. Click Edit
5. Set `email_confirmed_at` to current timestamp

### To Resend Verification Email:
Use the admin API endpoint or Supabase's built-in resend functionality.

The Supabase dashboard is your best bet for quickly seeing all unverified users and their status.