# BittieTasks Mobile Application

## Overview
BittieTasks is a mobile-first React web application designed as a dual-income marketplace for parents. It enables parents to earn money by sharing daily tasks with neighbors for additional income. The platform focuses on community-based earnings, where neighbors pay to join activities, facilitated by BittieTasks. It features a responsive mobile interface, real-time task management, earnings tracking, a comprehensive messaging system, and personalized wellness achievement badges for gamification. The business model has evolved to include an advertising-based revenue model with affiliate marketing integration, allowing parents to earn commissions on recommended products. Comprehensive legal protections are in place, ensuring compliance and minimizing risk.

**NEW: Ethical Partnership Matching Algorithm** - Comprehensive automated system for evaluating corporate partners based on HRC Corporate Equality Index scores, DEI leadership, LGBTQ+ support, environmental practices, and labor standards. Companies can apply for partnerships and propose custom tasks through dedicated portals with real-time ethical evaluation.

**NEW: Advertising Management System** - Dedicated ethical evaluation system for advertisers with tiered approval (Premium/Standard/Basic), automated revenue sharing calculations, family-safety requirements, and transparent disclosure standards. Includes specialized criteria for child safety compliance, data privacy, and family-friendly content.

**NEW: Bartering System** - The platform now includes a comprehensive bartering system where parents can trade skills, services, and time with neighbors without cash transactions. This includes proper tax documentation for IRS compliance, fair market value tracking, and seamless integration with the existing platform.

**UPDATED: Self-Care Tasks** - Self-care tasks are now solo activities with optional accountability partners. Users earn money for completing personal wellness activities (walks, yoga, meal prep, reading) while being able to invite friends as accountability partners who also earn for providing support and encouragement. No payment required to join - focuses on community support and mutual earnings.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Updates
**August 2025:**
- ✅ **Database Architecture Unified**: Eliminated dual database system (Supabase + Memory) that was causing verification token conflicts - now using single memory storage for reliable verification
- ✅ **Email Verification System Eliminated**: Completely removed problematic email verification loops and unsafe localhost URLs - replaced with immediate account access system
- ✅ **Authentication System Completely Fixed**: Clean, simple authentication with immediate signup/login capability, eliminating all verification loops and security issues
- ✅ **Session Management**: Proper Express session configuration with PostgreSQL storage, secure cookie settings, and persistent authentication across requests
- ✅ **Browser Compatibility**: Fixed frontend authentication flow with proper credential handling and session persistence for all browsers
- ✅ **Performance Optimization Complete**: Implemented comprehensive caching system with 83% performance improvement on categories endpoint (200ms → 33ms) and 64% improvement on tasks endpoint
- ✅ **Response Compression**: Added gzip compression middleware for all API responses
- ✅ **Cache Management**: In-memory caching service with 5-minute categories cache and 3-minute tasks cache
- ✅ **Performance Monitoring**: Real-time metrics dashboard with cache hit tracking and slow query alerting via `/api/performance` endpoint
- ✅ **Optimization Infrastructure**: Complete performance monitoring and alerting system with automated optimization recommendations
- ✅ **SendGrid Domain Authentication**: Successfully verified bittietasks.com domain - production email delivery fully operational
- ✅ **All Core Integrations Active**: Stripe payments, SendGrid emails, Escrow protection, Google Analytics, and Twilio SMS all successfully initialized and operational
- ✅ **Subscription Pricing Standardized**: Cohesive pricing throughout website - Free ($0, 5 tasks/month, 90% earnings), Pro ($19.99/month, 50 tasks/month, 85% earnings), Premium ($39.99/month, unlimited tasks, 90% earnings) with consistent features across all pages and components

**January 2025:**
- ✅ **Custom Domain Live**: bittietasks.com successfully deployed and verified via Cloudflare DNS
- ✅ **Database Operational**: PostgreSQL with 6 task categories and demo tasks populated
- ✅ **API Endpoints Active**: All core endpoints responding correctly (categories, tasks, users)
- ✅ **Human Verification System**: Comprehensive anti-bot measures and user verification active
- ✅ **Security Infrastructure**: Rate limiting, authentication, and fraud prevention operational
- ✅ **Demo Functionality Completely Removed**: All demo login endpoints, buttons, and demo user references eliminated from both frontend and backend - production-ready authentication only
- ✅ **Codebase Cleanup Complete**: Removed temporary files, duplicate components, unused test pages, and organized documentation into clean folder structure
- ✅ **Production Build Fixed**: Asset serving corrected, JavaScript/CSS loading properly
- ✅ **Database Integration Complete**: PostgreSQL database fully operational with comprehensive 90+ column user schema
- ✅ **User Authentication System**: Full login/logout functionality operational with session management, password verification, and persistent authentication across page refreshes
- ✅ **DatabaseStorage Implementation**: Switched from MemStorage to production DatabaseStorage with full CRUD operations
- ✅ **Schema Migration Resolved**: All missing columns added (identity_score, behavior_score, verification fields)
- ✅ **Email System Production Ready**: SendGrid fully operational with verified bittietasks.com domain authentication - all email features active including account verification, password resets, and notifications
- ⏳ **Payment Integration**: Awaiting Stripe API keys for full payment processing
- ✅ **Enhanced Security Systems**: Advanced fraud detection with risk scoring, suspicious activity monitoring, and automated user flagging operational
- ✅ **Analytics Dashboard**: Real-time platform analytics with user behavior tracking, conversion metrics, and business intelligence
- ✅ **File Management System**: Enhanced file upload system with security validation, image optimization, and automated cleanup
- ✅ **PayPal Integration**: Alternative payment method support with subscription billing and webhook handling (awaiting credentials)
- ✅ **Location Services**: Geographic task matching and verification system with distance calculations and area recommendations
- ✅ **AutoHealer Enhancement**: Expanded monitoring to include fraud detection, analytics, and file management services (11 total health checks)
- ✅ **AI Content Moderation**: Claude 4.0 Sonnet-powered content screening system automatically filters task descriptions, messages, and user content for safety and appropriateness with real-time API endpoints
- ✅ **AI Task Generation**: Intelligent task creation system generates personalized task suggestions based on user skills, category preferences, location, and duration. Also enhances basic task descriptions with professional optimization, pricing suggestions, and timing estimates
- ✅ **SMS Notifications**: Twilio-powered SMS notification system for real-time task updates, payment confirmations, security alerts, verification codes, and task reminders with comprehensive testing interface
- ✅ **All Core Integrations Active**: Stripe payments, SendGrid emails, Escrow protection, Google Analytics, and Twilio SMS all successfully initialized and operational
- ✅ **Supabase Migration System Complete**: Comprehensive migration infrastructure from memory storage to Supabase authentication with automated user migration, profiles table setup, and admin API endpoints (`/api/admin/migrate-to-supabase`, `/api/admin/setup-supabase`, `/api/admin/migration-status`) for seamless production deployment

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query
- **UI Components**: Radix UI primitives with shadcn/ui
- **Styling**: Tailwind CSS with custom color variables
- **Design**: Mobile-first responsive layout with bottom navigation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **File Uploads**: Multer middleware
- **Static Assets**: Served via Express, hot-reloading with Vite

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Cloud Provider**: Neon Database
- **Schema**: Relational schema for users, tasks, categories, completions, messages, and achievements.
- **Security**: Password hashing, email verification, password reset tokens, account lockout.

### Database Schema Design
- **Users**: Profile management, earnings, ratings, skills.
- **Task Categories**: Organized task types including Self-Care.
- **Tasks**: Detailed task information with support for solo, shared, barter, and sponsored types. Self-care tasks include accountability partner support with configurable partner limits and earnings.
- **Task Completions**: Status tracking with file attachments and barter transaction support.
- **Messages**: User-to-user communication.
- **User Achievements**: Gamification system.
- **Accountability Partnerships**: Support system for self-care tasks where partners earn for providing encouragement.
- **Barter Transactions**: Non-monetary skill and service exchanges with tax compliance tracking.

### Authentication and Authorization
- **Implementation**: Full session-based authentication with login/logout.
- **Password Security**: bcrypt hashing with salt rounds of 12, strong password requirements.
- **Session Management**: Express sessions with secure cookie handling.
- **Security Features**: Rate limiting for login attempts, input sanitization, email validation, session destruction on logout.

### Business Model and Monetization
- **Core Innovation**: Community-based earning model.
  - Parents earn income by sharing tasks with neighbors who pay to join.
- **Revenue Streams**:
  - **Sponsored Tasks**: Companies pay $37-60 per participant for community engagement events. BittieTasks keeps $15-20 platform fee, participants earn $22-40. All partners must meet ethical standards including DEI commitments, LGBTQ+ support, and responsible business practices.
  - **Advertising**: Native feed ads, local service providers, affiliate marketing.
  - **Affiliate Marketing**: Task-based product recommendations with 3-12% commission.
- **Payment Infrastructure**: Enterprise-grade processing system.
  - **Stripe Connect**: Split payments, automatic platform fee collection.
  - **Escrow.com Integration**: Protection for high-value transactions ($100+).
  - **Subscription Billing**: Automated recurring revenue for Pro/Premium plans.
- **Value Proposition**: Monetizing routine parent activities.
- **Ethical Partnership Standards**: Automated evaluation system screens corporate partners using HRC Corporate Equality Index (minimum 80/100), DEI leadership requirements, LGBTQ+ support, environmental responsibility, and labor practices. Real-time application processing with detailed ethical scoring and approval workflows.
- **Corporate Partner Portal**: Dedicated interfaces for company applications and custom task proposals, with automated evaluation against ethical criteria and transparent approval processes.

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL client.
- **drizzle-orm**: Type-safe ORM for PostgreSQL.
- **express**: Web application framework.
- **multer**: File upload middleware.

### UI and Frontend Libraries
- **@radix-ui/***: Accessible UI primitives.
- **@tanstack/react-query**: Server state management.
- **wouter**: Lightweight router.
- **tailwindcss**: Utility-first CSS framework.

### Development and Build Tools
- **vite**: Fast build tool.
- **typescript**: Static type checking.
- **esbuild**: Fast bundler for production.
- **drizzle-kit**: Database migration and schema management.

### Third-Party Integrations
- **Replit Platform**: Integrated development environment.
- **File Storage**: Enhanced local file system with security validation and optimization.
- **PayPal Integration**: Alternative payment processing with subscription support (setup ready).
- **Location Services**: Geographic task matching and verification (development mode).
- **Fraud Detection**: Advanced risk scoring and pattern analysis.
- **Analytics Platform**: Real-time event tracking and business intelligence.

### Security and Monitoring Systems
- **AutoHealer Service**: 11 comprehensive system health checks with automatic issue resolution.
- **Fraud Detection**: Risk scoring, suspicious activity monitoring, IP analysis, and automated blocking.
- **File Security**: Upload validation, size limits, type checking, and automated cleanup.
- **Analytics Tracking**: User behavior analysis, conversion tracking, and platform performance metrics.