# Overview

BittieTasks is a mobile-first community task marketplace designed to connect neighbors and facilitate local earning opportunities through intelligent task matching. The platform features complete fee transparency with a tiered structure: solo tasks (3% processing fee), community tasks (7% platform fee), barter exchange (0% fees), and corporate tasks (15% fee). Key capabilities include real-time payments via Stripe, automated AI verification systems for task completion, transparent payment breakdowns showing gross/net amounts, and comprehensive earnings tracking. The business vision emphasizes radical transparency and community trust through clear fee structures and fair market pricing.

## Recent Changes (August 2025)

- **Production Email Verification System Fully Operational**: Fixed Supabase redirect URL configuration, resolved Gmail delivery issues, implemented manual verification admin panel (August 16, 2025)
- **Complete Production Deployment Success**: Fixed GitHub integration issues, corrected Vercel environment variable configuration, restored automated deployment pipeline (August 16, 2025)
- **SendGrid Integration Verified**: Production email verification system working with noreply@bittietasks.com, 75/100 email credits available (August 16, 2025)
- **Environment Variable Configuration Resolved**: Fixed vercel.json format issues, properly configured SUPABASE_SERVICE_ROLE_KEY and SENDGRID_API_KEY in production (August 16, 2025)
- **GitHub Actions Fixed**: Resolved ESLint configuration and conditional React hooks issues preventing deployment (August 16, 2025)
- **Solo Task Application Flow Complete**: Fixed redirect issue after task application - users now properly flow through photo verification and payment processing to dashboard completion (August 16, 2025)
- **Hybrid Escrow System Implemented**: Smart payment protection with $50 threshold - tasks under $50 process immediately, $50+ use escrow with 24hr auto-release (January 15, 2025)
- **Advanced Payment Infrastructure**: Complete Stripe Live mode integration with manual capture for escrow, webhook processing, and transparent fee breakdown
- **Payment Protection Logic**: Automatic escrow determination based on task value and type - barter tasks bypass payment entirely
- **Escrow Management System**: Full API endpoints for escrow release, dispute handling, and automated fund distribution with earnings tracking
- **Enhanced Payment UI**: EscrowStatus component shows protection level, auto-release timing, and payment flow transparency
- **Production Payment Processing**: Real Stripe Live keys configured with webhook endpoints for immediate production capability
- **Email Verification System Complete**: Full SendGrid integration with verified sender authentication - production ready (January 16, 2025)
- **Authentication Security**: Users must verify email before accessing platform features - unverified users are properly blocked
- **Verification Infrastructure**: Supabase Service Role Key configured for secure user creation and token storage
- **Professional Email Flow**: Custom verification emails with BittieTasks branding sent via SendGrid API
- **Phase 1, 2, 3A & 3B Complete**: Enhanced homepage navigation, advanced task filtering system, complete payment infrastructure, and AI-powered verification system successfully deployed
- **Phase 4A: Real-Time Messaging System**: Task-specific communication channels with polling-based message updates for immediate task coordination (January 16, 2025)
- **Email Verification System Fully Operational**: Fixed Supabase redirect URL configuration, resolved Gmail delivery issues, implemented manual verification admin panel (January 16, 2025)
- **Production Email Verification URLs**: Updated ALL verification email systems to use www.bittietasks.com production domain instead of development URLs (August 16, 2025)
- **Multiple Email System Fix**: Identified and fixed conflicting email verification systems in lib/email-simple.ts and lib/email-verification.ts (August 16, 2025)
- **User Account Recovery System**: Created manual signup and verification endpoints to handle failed registration scenarios (August 16, 2025)
- **Complete Authentication System**: Full sign-up/sign-in flow with email verification ready for production
- **Database Integration**: Aligned application code with existing Supabase database structure and security policies  
- **Authentication Guards**: All critical pages properly protected - task creation, dashboard, and platform features require authentication
- **Public Access Maintained**: Landing pages, task browsing, and informational pages remain publicly accessible
- **Modern Dashboard**: Replaced tab navigation with elegant card-based interface and dropdown task exploration
- **Real Data Integration**: Connected dashboard and task pages to actual API endpoints with proper error handling
- **Flow Optimization**: Comprehensive user flow verification ensuring smooth navigation across all 23 pages
- **Redirect Fixes**: All authentication and navigation redirects properly configured to existing pages
- **Sign-Out Functionality**: Added proper sign-out button to dashboard with error handling
- **Solo Task Applications**: Fixed database integration - applications now persist and show on dashboard
- **Professional UI**: Enhanced visual design with color-coded navigation and improved user experience
- **Production Build Success**: Fixed TypeScript optional chaining errors in verification components - builds passing (January 16, 2025)
- **Phase 3B: AI Verification System**: Complete intelligent photo verification using OpenAI GPT-4o with 70%+ accuracy threshold (January 16, 2025)
- **Smart Verification Logic**: AI analyzes before/after photos, provides confidence scores, quality ratings, and automatic escrow release
- **Admin Review Dashboard**: Manual verification interface for complex cases requiring human oversight  
- **Verification Components**: PhotoVerification and VerificationStatus components with full upload and status tracking
- **Database Schema**: Advanced task_verifications table with AI analysis results, confidence scores, and admin review workflow
- **Task Application Authentication**: Added proper auth checks to task pages - unauthenticated users are guided to sign-in instead of getting API errors
- **User Experience Enhancement**: All task pages now gracefully handle authentication state with clear user guidance
- **Dashboard Transformation**: Real user statistics replace placeholders - earnings, tasks, applications with empty state guidance
- **Phase 2 Complete**: Advanced task filtering system with search, difficulty, status, and sorting across all task types
- **Enhanced Create Flows**: Improved task creation pages with shared navigation, clearer fee structure displays, and better user guidance
- **Consistent Navigation**: Shared navigation component with authentication awareness and proper back navigation
- **Task Page Polish**: Better layouts, improved filtering, enhanced visual hierarchy, and clear fee transparency

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: Next.js 15 with React 18 and TypeScript.
- **Styling**: Tailwind CSS combined with Radix UI components for a consistent design system.
- **State Management**: React Query for server state and built-in React state for UI.
- **Authentication**: Phone-first verification using Supabase Auth.
- **Responsive Design**: Mobile-first approach utilizing Tailwind's responsive utilities.
- **User Onboarding**: A 3-step phone verification process (phone number entry → SMS code verification → profile creation).
- **UI/UX Decisions**: The platform features a clean, mobile-optimized design with a focus on intuitive navigation. Color schemes are designed for clarity and user engagement.

## Backend Architecture
- **API Layer**: Next.js API routes implemented as serverless functions.
- **Database ORM**: Drizzle ORM for type-safe database interactions.
- **Authentication**: Supabase Auth, secured with Row Level Security (RLS) policies.
- **File Storage**: Supabase Storage for media related to task verification.
- **Real-time Features**: Supabase real-time subscriptions enable live updates across the platform.

## Data Storage Solutions
- **Primary Database**: PostgreSQL, managed through Supabase, with a comprehensive schema.
- **Schema Management**: Drizzle Kit is used for database migrations and version control.
- **Data Models**: Key data models include Users, Tasks, Task Participants, Transactions, and Verification Submissions.
- **Security**: Row Level Security policies are rigorously applied for data access control.
- **Performance**: Optimized query patterns and indexed foreign keys ensure efficient data retrieval.

## Payment Processing
- **Payment Gateway**: Stripe Live mode integrated for production payment processing and webhook handling.
- **Hybrid Escrow System**: Smart protection with $50 threshold - immediate processing for convenience, escrow for security.
- **Transparent Fee Structure**:
    - **Solo Tasks**: 3% processing fee for platform-funded convenience tasks
    - **Community Tasks**: 7% platform fee for peer-to-peer coordination and messaging
    - **Barter Exchange**: 0% fees for direct value trading without monetary exchange
    - **Corporate Tasks**: 15% fee for high-value corporate partnerships
- **Escrow Protection**: Tasks $50+ use automatic escrow with 24-hour auto-release and dispute resolution.
- **Payment Transparency**: All task displays show gross amount, fee breakdown, net payout, and escrow status.
- **Revenue Streams**: Processing fees from solo tasks (3%), commissions from community tasks (7%), corporate partnerships (15%).
- **Verification System**: AI-powered photo/video verification with manual review fallback.
- **Payout Processing**: Immediate release for small tasks, escrow release for large tasks upon verification.
- **Transaction Tracking**: Comprehensive earnings dashboard showing gross/net amounts, escrow status, and fee transparency.

## Verification and Trust System
- **Auto-Verification**: Leverages machine learning for photo/video verification.
- **Risk Assessment**: Includes fraud detection scoring and triggers for manual review.
- **Task Approval**: A multi-tier approval system based on task complexity and risk.
- **User Reputation**: An achievement system and verification levels build user trust.
- **Content Moderation**: Automated and manual processes for content review.

# External Dependencies

## Core Services
- **Supabase**: Serves as the primary Backend-as-a-Service, providing PostgreSQL database, phone-based authentication, real-time subscriptions, and file storage.
- **Twilio**: Utilized for SMS verification in phone number authentication and task notifications.
- **Stripe**: The chosen platform for payment processing, webhook handling, and subscription management.
- **Vercel**: Used for production deployment and hosting of the application.

## Development Tools
- **Drizzle ORM**: Enables type-safe database operations and schema management.
- **React Query**: Manages server state and data caching.
- **Radix UI**: Provides accessible component primitives for UI development.
- **Tailwind CSS**: A utility-first CSS framework for efficient and responsive design.

## Infrastructure
- **Deployment**: Vercel facilitates automatic deployments directly from GitHub.
- **Database**: PostgreSQL database hosted on Supabase, with automated backups.
- **CDN**: Vercel Edge Network ensures global content delivery.
- **Environment Management**: Secure handling of environment variables across development and production environments.

## Monitoring and Analytics
- **Error Tracking**: Built-in error boundaries with console logging.
- **Performance Monitoring**: Next.js's integrated analytics and performance metrics.
- **User Analytics**: Google Analytics integration for tracking user behavior.
- **Database Performance**: Supabase provides performance insights and query optimization tools.