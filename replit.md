# Overview

BittieTasks is a LIVE, ACTIVE production platform that functions as a mobile-first community task marketplace. It connects neighbors, facilitating local earning opportunities through intelligent task matching. The platform supports solo tasks, community tasks, barter exchanges, and corporate tasks, each with transparent fee structures (3% to 15%, barter is 0%). Key capabilities include real-time payments via Stripe, automated AI verification for task completion, transparent payment breakdowns, and comprehensive earnings tracking. The business vision emphasizes radical transparency and community trust through clear fee structures and fair market pricing, aiming to be fully operational for real users with complete fee transparency.

## Recent Changes - August 17, 2025
- ✅ **AUTHENTICATION CONFLICTS RESOLVED**: Eliminated redirect loop by removing 4 conflicting auth systems (useSimpleAuth, useSupabaseAuth, duplicate useAuth hooks)
- ✅ **BUILD SYSTEM STABILIZED**: Fixed missing @tailwindcss/typography dependency and invalid CSS syntax preventing compilation
- ✅ **DUPLICATE CODE CLEANUP**: Removed lib/lib/ directory duplicates, fixed all broken import paths, created missing library files
- ✅ **SSR PRODUCTION ISSUES FIXED**: Resolved critical payments/success page SSR incompatibility causing build failures
- ✅ **PRODUCTION BUILD SUCCESS**: Platform compiles successfully in 30.0s with no TypeScript errors, no SSR errors
- ✅ **READY FOR DEPLOYMENT**: All critical issues resolved, authentication system unified, SSR-compatible, platform stable for GitHub push and live production

# User Preferences

Preferred communication style: Simple, everyday language.
Platform Status: LIVE and ACTIVE for real users - no demo or mock data allowed.
UI/UX Preference: Unified app interface over traditional multi-page navigation - all authenticated user actions in one cohesive section.
Work Style: Continue working at comprehensive level - thorough independent problem-solving, complete solutions, up to 1-hour deep focus sessions without interruption.

# System Architecture

## Frontend Architecture
- **Framework**: Next.js 15 with React 18 and TypeScript.
- **Styling**: Tailwind CSS combined with Radix UI components.
- **State Management**: React Query for server state and built-in React state for UI.
- **Authentication**: Phone-first verification using Supabase Auth.
- **Responsive Design**: Mobile-first approach utilizing Tailwind's responsive utilities.
- **User Onboarding**: A 3-step phone verification process (phone number entry → SMS code verification → profile creation).
- **UI/UX Architecture**: Unified app interface with sidebar navigation - all authenticated actions happen in one cohesive container without page reloads.
- **Navigation System**: AuthenticatedApp component with smooth section switching, unified task application flow, and persistent user state.

## Backend Architecture
- **API Layer**: Next.js API routes implemented as serverless functions.
- **Database ORM**: Drizzle ORM for type-safe database interactions.
- **Authentication**: Supabase Auth, secured with Row Level Security (RLS) policies.
- **File Storage**: Supabase Storage for media related to task verification.
- **Real-time Features**: Supabase real-time subscriptions for live updates.

## Data Storage Solutions
- **Primary Database**: PostgreSQL, managed through Supabase, with a comprehensive schema for LIVE PRODUCTION USE.
- **Schema Management**: Drizzle Kit for database migrations and version control.
- **Data Models**: Key data models include Users, Tasks, Task Participants, Transactions, and Verification Submissions, storing REAL USER DATA.
- **Security**: Row Level Security policies are rigorously applied for data access control.
- **Performance**: Optimized query patterns and indexed foreign keys ensure efficient data retrieval for LIVE OPERATIONS.

## Payment Processing - LIVE PRODUCTION SYSTEM
- **Payment Gateway**: Stripe Live mode integrated for REAL MONEY transactions and production payment processing.
- **Hybrid Escrow System**: Smart protection with $50 threshold - immediate processing for convenience, escrow for security.
- **Transparent Fee Structure**: REAL FEES COLLECTED: Solo Tasks (3%), Community Tasks (7%), Barter Exchange (0%), Corporate Tasks (15%).
- **Escrow Protection**: Tasks $50+ use automatic escrow with 24-hour auto-release and dispute resolution.
- **Payment Transparency**: All task displays show gross amount, fee breakdown, net payout, and escrow status.
- **Revenue Streams**: ACTIVE revenue generation from processing fees, commissions, and corporate partnerships.
- **Verification System**: AI-powered photo/video verification with manual review fallback for REAL TASK COMPLETIONS.
- **Payout Processing**: Immediate release for small tasks, escrow release for large tasks upon verification - REAL MONEY TO USERS.
- **Transaction Tracking**: Comprehensive earnings dashboard showing ACTUAL user earnings, escrow status, and fee transparency.

## Verification and Trust System
- **Auto-Verification**: Leverages machine learning for photo/video verification.
- **Risk Assessment**: Includes fraud detection scoring and triggers for manual review.
- **Task Approval**: Multi-tier approval system based on task complexity and risk.
- **User Reputation**: An achievement system and verification levels build user trust.
- **Content Moderation**: Automated and manual processes for content review.

# External Dependencies

## Core Services
- **Supabase**: Primary Backend-as-a-Service, providing PostgreSQL database, phone-based authentication, real-time subscriptions, and file storage.
- **Twilio**: Utilized for SMS verification in phone number authentication and task notifications.
- **Stripe**: Chosen platform for payment processing, webhook handling, and subscription management.
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
- **Environment Management**: Secure handling of environment variables across environments.

## Monitoring and Analytics
- **Error Tracking**: Built-in error boundaries with console logging.
- **Performance Monitoring**: Next.js's integrated analytics and performance metrics.
- **User Analytics**: Google Analytics integration for tracking user behavior.
- **Database Performance**: Supabase provides performance insights and query optimization tools.