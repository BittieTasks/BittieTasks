# Overview

BittieTasks is a mobile-first community task marketplace that connects neighbors and enables local earning opportunities through intelligent task matching. The platform operates with a dual payment model: peer-to-peer tasks (users pay users, 7% platform fee) and BittieTasks platform payments (BittieTasks pays users directly, 0% fee). Additional revenue comes from corporate sponsored tasks (15% fee). The application features real-time payments through Stripe integration, automated verification systems, and comprehensive earnings tracking.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes (August 13, 2025)

- Fixed Next.js 15 runtime error (clientReferenceManifest issue) with proper experimental server actions configuration
- Clarified dual payment model: peer-to-peer (7% fees) and BittieTasks platform payments (0% fees)  
- Designed 8 curated inclusive daily tasks (4 platform-funded, 4 peer-to-peer)
- Updated API column names for database compatibility (snake_case format)
- Verified production build success with Next.js 15.4.6 (43 pages generated)
- Created comprehensive documentation for payment structure and task curation
- Platform ready for GitHub push and production deployment

# System Architecture

## Frontend Architecture
- **Framework**: Next.js 15 with React 18 and TypeScript for type safety
- **Styling**: Tailwind CSS with Radix UI components for consistent design system
- **State Management**: React Query for server state and built-in React state for UI
- **Authentication**: Supabase Auth with email verification and session management
- **Responsive Design**: Mobile-first approach with Tailwind responsive utilities

## Backend Architecture
- **API Layer**: Next.js API routes with serverless functions
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Supabase Auth with Row Level Security (RLS) policies
- **File Storage**: Supabase Storage for task verification media
- **Real-time Features**: Supabase real-time subscriptions for live updates

## Data Storage Solutions
- **Primary Database**: PostgreSQL via Supabase with comprehensive schema
- **Schema Management**: Drizzle Kit for migrations and schema versioning
- **Data Models**: Users, tasks, task participants, transactions, and verification submissions
- **Security**: Row Level Security policies for data access control
- **Performance**: Indexed foreign keys and optimized query patterns

## Payment Processing
- **Payment Gateway**: Stripe integration with webhook processing
- **Dual Payment Model**: 
  - Peer-to-Peer: Users pay other users directly, BittieTasks takes 7% commission
  - Platform Payments: BittieTasks pays users directly for completed tasks (0% fee)
- **Revenue Streams**: P2P commissions (7%), corporate partnerships (15%), platform investment (0%)
- **Verification System**: Automated photo/video verification with manual review fallback
- **Payout Processing**: Automatic payment release upon task verification
- **Transaction Tracking**: Comprehensive earnings dashboard and payment history
- **Production Code Cleanup**: Removed 200+ development/testing files, streamlined API structure to 24 core endpoints, production-ready codebase

## Verification and Trust System
- **Auto-Verification**: Machine learning-based photo/video verification
- **Risk Assessment**: Fraud detection scoring and manual review triggers
- **Task Approval**: Multi-tier approval system based on task complexity and risk
- **User Reputation**: Achievement system and verification levels
- **Content Moderation**: Automated and manual content review processes

# External Dependencies

## Core Services
- **Supabase**: Backend-as-a-Service providing PostgreSQL database, authentication, real-time subscriptions, and file storage
- **Stripe**: Payment processing, webhook handling, and subscription management
- **Vercel**: Production deployment and hosting platform

## Development Tools
- **Drizzle ORM**: Type-safe database operations and schema management
- **React Query**: Server state management and caching
- **Radix UI**: Accessible component primitives for UI design
- **Tailwind CSS**: Utility-first CSS framework for responsive design

## Infrastructure
- **Deployment**: Vercel with automatic deployments from GitHub
- **Database**: PostgreSQL hosted on Supabase with automated backups
- **CDN**: Vercel Edge Network for global content delivery
- **Environment Management**: Secure environment variable handling across development and production

## Monitoring and Analytics
- **Error Tracking**: Built-in error boundaries with console logging
- **Performance Monitoring**: Next.js built-in analytics and performance metrics
- **User Analytics**: Google Analytics integration for user behavior tracking
- **Database Performance**: Supabase performance insights and query optimization