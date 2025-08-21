# BittieTasks Unified Authentication System Reference

## Current Authentication Architecture (January 2025)

**SINGLE SYSTEM:** The platform uses ONE unified authentication system located in `lib/unified-auth.ts`

### Core Components

#### 1. UnifiedAuth Class (`lib/unified-auth.ts`)
- **Purpose**: Central authentication manager handling all auth operations
- **Session Storage**: localStorage with key `bittie_unified_session`
- **Token Management**: Automatic refresh 60 seconds before expiration
- **Error Handling**: Comprehensive error handling with fallback mechanisms

```typescript
// Key methods:
UnifiedAuth.signIn(email, password)     // Sign in user
UnifiedAuth.signUp(signupData)          // Create new user
UnifiedAuth.signOut()                   // Sign out and clear session
UnifiedAuth.getCurrentUser()            // Get current authenticated user
UnifiedAuth.getAccessToken()            // Get valid access token
UnifiedAuth.isAuthenticated()           // Check auth status
```

#### 2. UnifiedAuthProvider (`components/auth/SimpleAuthProvider.tsx`)
- **Purpose**: React context provider for authentication state
- **State Management**: Centralized auth state with loading indicators
- **Auto-refresh**: Monitors token expiration and refreshes automatically
- **Event Listeners**: Responds to Supabase auth state changes

```typescript
// Available via useAuth() hook:
const { user, isAuthenticated, loading, signIn, signUp, signOut } = useAuth()
```

#### 3. API Client (`lib/api-client.ts`)
- **Purpose**: Centralized API client with automatic authentication
- **Token Injection**: Automatically adds Bearer tokens to all requests
- **Error Handling**: Handles 401 errors and redirects to login
- **Type Safety**: Strongly typed request/response handling

### Integration Points

#### API Routes (All Updated for Unified Auth)
- `GET /api/auth/user` - Get current user with Bearer token validation
- `GET /api/auth/session` - Session validation and refresh
- `POST /api/auth/session` - Token refresh endpoint
- `POST /api/auth/signin` - User sign in
- `POST /api/auth/signup` - User registration

#### Component Integration
- **TaskApplicationModal**: Uses UnifiedAuth for task operations
- **Dashboard Components**: All authenticated via unified system
- **Payment Processing**: Stripe integration uses unified auth tokens
- **Subscription Management**: Full integration with auth state

#### Page-Level Authentication
- **Home Page**: Auto-redirects authenticated users to dashboard
- **Auth Page**: Handles sign in/up with unified system
- **Dashboard App**: Protected route requiring authentication
- **All Task Pages**: Authentication-gated with unified system

### Session Management Features

#### Persistent Sessions
- Sessions survive browser refresh and tab closure
- Automatic restoration on app reload
- Cross-tab synchronization via localStorage events

#### Token Management
- JWT tokens from Supabase Auth
- Automatic refresh before expiration
- Secure storage in localStorage
- Cleanup on sign out

#### Error Handling
- Invalid token detection and cleanup
- Network error resilience
- User-friendly error messages
- Automatic redirect to login when needed

### Security Features

#### Token Security
- Bearer token authentication for all API calls
- Secure token storage (localStorage)
- Automatic token refresh cycle
- Token validation on each request

#### Session Security
- Row Level Security (RLS) on database
- Server-side token validation
- Protected API endpoints
- Secure user data handling

### Usage Guidelines for New Features

#### When Adding New Components:
1. Import the auth hook: `import { useAuth } from '@/components/auth/SimpleAuthProvider'`
2. Use authentication state: `const { user, isAuthenticated, loading } = useAuth()`
3. Handle loading states while auth initializes
4. Redirect unauthenticated users as needed

#### When Adding New API Endpoints:
1. Use the API client: `import { apiRequest } from '@/lib/api-client'`
2. API client automatically adds Bearer tokens
3. Handle 401 responses (user will be redirected to login)
4. Server-side: validate tokens using `createServerClient(request)`

#### When Adding Protected Routes:
1. Check authentication state: `const { isAuthenticated, loading } = useAuth()`
2. Show loading spinner during auth check
3. Redirect to `/auth` if not authenticated
4. Only render protected content when `isAuthenticated === true`

### Key Files to Reference

#### Core Authentication Files:
- `lib/unified-auth.ts` - Main authentication logic
- `components/auth/SimpleAuthProvider.tsx` - React context provider  
- `lib/api-client.ts` - API client with auth integration
- `lib/supabase.ts` - Supabase client configuration

#### API Integration:
- `app/api/auth/user/route.ts` - User data endpoint
- `app/api/auth/session/route.ts` - Session management
- `app/api/auth/signin/route.ts` - Sign in endpoint
- `app/api/auth/signup/route.ts` - Sign up endpoint

#### Component Examples:
- `components/AuthStatus.tsx` - Authentication status display
- `components/TaskApplicationModal.tsx` - Task operations with auth
- `app/page.tsx` - Home page with auth routing
- `app/auth/page.tsx` - Authentication form

### Migration Notes

#### Removed Systems:
- ❌ `lib/simple-auth.ts` (deleted - was causing conflicts)
- ❌ `lib/manual-auth.ts` (deleted - was causing conflicts)
- ❌ Multiple competing Supabase auth implementations

#### Consolidated Into:
- ✅ Single `UnifiedAuth` class in `lib/unified-auth.ts`
- ✅ One auth provider in `components/auth/SimpleAuthProvider.tsx`
- ✅ Centralized API client with automatic auth injection

### Testing Authentication

Use the `AuthStatus` component to test authentication state:

```typescript
import { AuthStatus } from '@/components/AuthStatus'

// Shows current auth state, user details, and sign out button
<AuthStatus showDetails={true} />
```

### Production Readiness

The unified authentication system is production-ready with:
- ✅ Session persistence across browser sessions
- ✅ Automatic token refresh preventing expired sessions
- ✅ Comprehensive error handling and user feedback
- ✅ Integration with all platform features (tasks, payments, subscriptions)
- ✅ Security best practices with RLS and token validation
- ✅ Cross-browser compatibility and mobile support

**Important**: Always reference this document when adding new features to ensure proper authentication integration.