# Overview

BittieTasks is a mobile-first community task marketplace designed to connect neighbors and facilitate local earning opportunities through intelligent task matching. The platform features complete fee transparency with a tiered structure: solo tasks (3% processing fee), community tasks (7% platform fee), barter exchange (0% fees), and corporate tasks (15% fee). Key capabilities include real-time payments via Stripe, automated AI verification systems for task completion, transparent payment breakdowns showing gross/net amounts, and comprehensive earnings tracking. The business vision emphasizes radical transparency and community trust through clear fee structures and fair market pricing.

## Recent Changes (January 2025)

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
- **Critical Build Fix**: Resolved JSX syntax error that was blocking GitHub deployments (January 15, 2025)
- **Task Application Authentication**: Added proper auth checks to task pages - unauthenticated users are guided to sign-in instead of getting API errors
- **User Experience Enhancement**: All task pages now gracefully handle authentication state with clear user guidance
- **Phase 1 Complete**: Enhanced homepage with authentication-aware navigation and dynamic Sign Up/Sign In buttons
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
- **Payment Gateway**: Stripe is integrated for all payment processing and webhook handling.
- **Transparent Fee Structure**:
    - **Solo Tasks**: 3% processing fee for platform-funded convenience tasks
    - **Community Tasks**: 7% platform fee for peer-to-peer coordination and messaging
    - **Barter Exchange**: 0% fees for direct value trading without monetary exchange
    - **Corporate Tasks**: 15% fee for high-value corporate partnerships
- **Payment Transparency**: All task displays show gross amount, fee breakdown, and net payout
- **Revenue Streams**: Processing fees from solo tasks (3%), commissions from community tasks (7%), corporate partnerships (15%).
- **Verification System**: AI-powered photo/video verification with manual review fallback.
- **Payout Processing**: Net payments automatically released upon task verification.
- **Transaction Tracking**: Comprehensive earnings dashboard showing gross/net amounts and fee transparency.

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