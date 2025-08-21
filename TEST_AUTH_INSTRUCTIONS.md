# 🧪 How to Test Your Authentication Setup

## Method 1: Browser Test Page
Visit this URL in your browser:
```
http://localhost:5000/test-auth
```

**If the page won't load:**
1. Make sure your development server is running (`npm run dev`)
2. Check that port 5000 is accessible
3. Try refreshing the page (it may take a moment to compile)

## Method 2: Direct API Test  
Visit this URL to get raw JSON test results:
```
http://localhost:5000/api/auth/test
```

## Method 3: Manual Browser Testing

### Test Your Current Setup:
1. **Go to:** `http://localhost:5000/auth`
2. **Try signing up** with a test email
3. **Check if you receive** a confirmation email
4. **Try signing in** with existing credentials

### What Should Happen:
- ✅ Sign up sends confirmation email
- ✅ Sign in redirects to dashboard  
- ✅ Session persists when refreshing
- ✅ No console errors

## Method 4: Console Test (If browser isn't working)

Run this in your terminal:
```bash
# Test basic connectivity
curl http://localhost:5000/api/auth/session

# Test detailed configuration
curl http://localhost:5000/api/auth/test
```

## 🔧 Troubleshooting

### If localhost:5000 won't connect:
1. **Check your terminal** - make sure you see "Ready" in the server logs
2. **Try this URL instead:** `http://0.0.0.0:5000/test-auth`
3. **Or try:** The webview URL that Replit provides

### If the page loads but tests fail:
The test page will show you exactly what needs to be configured in:
- Supabase settings
- Environment variables  
- URL configuration

### Quick Environment Check:
Your `.env.local` should have:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📊 What the Tests Check:
- Environment variables are set correctly
- Supabase connection is working
- Session management functions
- API authentication works
- Token handling is configured
- URL redirects are set up

The authentication system is ready for production once all tests pass!