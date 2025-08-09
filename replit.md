# BittieTasks Mobile Application

## Overview
BittieTasks is a mobile-first React web application that serves as a dual-income marketplace for parents. Its primary purpose is to enable parents to earn money by sharing daily tasks with neighbors and to monetize routine parent activities. The platform facilitates community-based earnings, where neighbors pay to join activities, and also includes features for self-care tasks with optional accountability partners. Key capabilities include real-time task management, earnings tracking, a comprehensive messaging system, and gamified wellness achievements. The business model incorporates an advertising-based revenue model with affiliate marketing integration, allowing parents to earn commissions. The platform now also features an ethical partnership matching algorithm for corporate partners, a comprehensive bartering system for skill/service exchange, and an advertising management system with ethical evaluation.

## User Preferences
Preferred communication style: Simple, everyday language.

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
- **Static Assets**: Served via Express

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Cloud Provider**: Neon Database
- **Schema**: Relational schema for users, tasks, categories, completions, messages, and achievements. Supports solo, shared, barter, and sponsored task types, including self-care tasks with accountability partners. Barter transactions include tax compliance tracking.
- **Security**: Password hashing, account lockout.

### Authentication and Authorization
- **Implementation**: Supabase authentication with JWT tokens and email verification.
- **Email Verification**: SendGrid SMTP integration for reliable email delivery.
- **Session Management**: PKCE authentication flow with secure token handling.
- **Security Features**: Bearer token authentication, RLS database policies, unauthorized access prevention.
- **Migration Status**: COMPLETE - Frontend and backend fully integrated with Supabase.

### Business Model and Monetization
- **Core Innovation**: Community-based earning model where parents earn by sharing tasks.
- **Revenue Streams**: Sponsored tasks (companies pay for community engagement, meeting ethical standards), advertising (native feed ads, local service providers), and affiliate marketing (task-based product recommendations).
- **Payment Infrastructure**: Enterprise-grade processing system including Stripe Connect for split payments and automatic platform fee collection, and Escrow.com integration for high-value transactions.
- **Ethical Partnership Standards**: Automated evaluation system screens corporate partners using criteria like HRC Corporate Equality Index, DEI leadership, LGBTQ+ support, environmental responsibility, and labor practices. Includes a Corporate Partner Portal for applications and custom task proposals.

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
- **Stripe**: Payment processing for subscription billing and platform fees.
- **Escrow.com**: Transaction protection for high-value transactions.
- **SendGrid**: SMTP provider for Supabase authentication emails and business communications.
- **Twilio**: SMS notification system for real-time task updates and security alerts.
- **Google Analytics**: Platform analytics and user behavior tracking.
- **Supabase**: Production-ready authentication system with SMTP email delivery via SendGrid.
- **Claude 4.0 Sonnet**: AI for content moderation and intelligent task generation.
- **PayPal**: Alternative payment processing.

### Security and Monitoring Systems
- **AutoHealer Service**: Comprehensive system health checks with automatic issue resolution.
- **Fraud Detection**: Risk scoring, suspicious activity monitoring, and automated blocking.
- **File Security**: Upload validation, size limits, type checking, and automated cleanup.