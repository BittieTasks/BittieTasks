# BittieTasks Complete Page List

## **MAIN PRODUCTION PAGES** (Core Platform)

### **Public Pages** (No Authentication Required)
1. **`/` (Home)** - Landing page with "Little Tasks, Real Income" hero
2. **`/auth`** - Sign in/Sign up page with tabs
3. **`/examples`** - Task examples and platform overview
4. **`/policies`** - Terms of Service, Privacy Policy, Guidelines

### **Protected Pages** (Authentication Required)
5. **`/marketplace`** - Main task browsing with filters and categories
6. **`/dashboard`** - User earnings, stats, and activity overview
7. **`/create-task`** - Task creation form for posting new tasks
8. **`/earnings`** - Detailed earnings tracking and payout history
9. **`/task/[id]`** - Individual task detail and application page
10. **`/subscriptions`** - Subscription plan management (Free/Pro/Premium)
11. **`/subscribe`** - Stripe subscription signup flow

### **Business Pages**
12. **`/sponsors`** - Corporate partnership and sponsored tasks
13. **`/platform`** - Platform information and business features
14. **`/platform/create`** - Enterprise task creation tools

### **Administrative Pages**
15. **`/admin/approvals`** - Task approval management system
16. **`/welcome`** - Post-signup welcome and onboarding

## **DEVELOPMENT/TESTING PAGES** (Can be cleaned up)

### **Authentication Testing**
17. **`/auth-debug`** - Debug authentication issues
18. **`/auth/callback`** - OAuth callback handling
19. **`/simple-auth-test`** - Simple auth flow testing
20. **`/test-auth`** - Authentication system testing

### **Payment Testing**
21. **`/test-payments`** - Stripe payment integration testing
22. **`/test-simple`** - Simple payment flow testing

### **UI Testing**
23. **`/test-bold`** - Typography and styling tests

## **LAYOUT & STRUCTURE FILES**
- **`app/layout.tsx`** - Root layout with providers and navigation
- **`app/globals.css`** - Global styles and Tailwind configuration
- **`app/providers.tsx`** - Context providers wrapper

## **API ENDPOINTS**
### **Authentication APIs**
- `/api/auth/*` - User authentication and profile management

### **Task APIs**
- `/api/tasks/*` - Task CRUD operations
- `/api/categories/*` - Task category management

### **Payment APIs**
- `/api/stripe/*` - Payment processing and subscription management

### **Testing APIs**
- `/api/test/*` - Development testing endpoints

---

## **SUGGESTED CLEANUP**
Consider removing these development/testing pages before production:
- `/auth-debug`
- `/simple-auth-test` 
- `/test-auth`
- `/test-payments`
- `/test-simple`
- `/test-bold`

## **MAIN USER FLOW**
1. **`/`** → **`/auth`** → **`/marketplace`** → **`/task/[id]`**
2. **Dashboard**: **`/dashboard`** → **`/earnings`** → **`/subscriptions`**
3. **Task Creation**: **`/create-task`** → **`/admin/approvals`**