# BittieTasks Authentication System Reference

## Current Status: Phone Authentication + Email Fallback

### Architecture Overview
- **Primary**: Phone-based authentication using Supabase Auth + Twilio SMS
- **Fallback**: Email authentication for users without phone access
- **Session Management**: Unified authentication provider with persistent sessions

### Authentication Flow
1. **Phone Signup**: Enter phone → SMS verification → Profile creation → Dashboard
2. **Email Signup**: Enter email → Password → Email verification → Profile → Dashboard  
3. **Login**: Phone/Email detection → Appropriate flow → Dashboard

### Critical Files
- `components/auth/SimpleAuthProvider.tsx` - Unified auth context provider
- `lib/simple-supabase-auth.ts` - Auth service layer
- `lib/supabase.ts` - Supabase client configuration
- `components/auth/phone-signup-form.tsx` - Phone-based signup flow
- `app/auth/phone-signup/page.tsx` - Phone signup page

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL` ✅ Available
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅ Available
- `SUPABASE_SERVICE_ROLE_KEY` ✅ Available  
- `TWILIO_ACCOUNT_SID` ✅ Available
- `TWILIO_AUTH_TOKEN` ✅ Available
- `TWILIO_PHONE_NUMBER` ✅ Available

### Known Issues (August 2025)
1. **Phone Signup**: SMS verification may fail due to Supabase phone auth configuration
2. **Session Persistence**: Users may need to re-authenticate frequently
3. **Error Handling**: Generic error messages don't provide clear guidance

### Recovery Steps
1. Check Supabase project has phone authentication enabled
2. Verify Twilio credentials are properly configured in Supabase
3. Test authentication flow with valid phone numbers
4. Implement robust error handling with specific messages

### Production Requirements
- Supabase phone authentication must be enabled
- Twilio integration properly configured
- Rate limiting for SMS to prevent abuse
- Graceful fallback to email if phone fails

## Next Steps for Fixing
1. Create simplified email authentication as fallback
2. Implement robust error handling with clear messages  
3. Add authentication state debugging
4. Test complete signup → login → session flow
5. Document working configuration for production deployment