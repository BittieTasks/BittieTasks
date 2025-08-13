# BittieTasks Mobile Application

## Overview
BittieTasks is a mobile-first React web application designed as a dual-income marketplace for adults. Its core purpose is to facilitate community-based earnings by enabling users to monetize daily tasks and routine activities by sharing them with neighbors. The platform also supports self-care tasks with optional accountability partners. Key capabilities include real-time task management, earnings tracking, a comprehensive messaging system, and gamified wellness achievements. The business model integrates advertising, affiliate marketing, an ethical partnership matching algorithm for corporate sponsors, a comprehensive bartering system, and an advertising management system with ethical evaluation. The project aims for revenue sustainability, managing payment processing costs, and addressing taxation, with a vision for platform-funded tasks where BittieTasks directly pays for tasks from subscription and advertising revenue.

## User Preferences
Preferred communication style: Senior programming engineer level technical communication.
Development workflow: Uses Replit as development workspace, GitHub for version control, and Vercel for production deployment.
Business goals: Seeking guidance on business formation, legal structure, and monetization strategy for BittieTasks platform.
Current focus: Revenue sustainability, payment processing costs, and taxation rather than user acquisition.
Business model strategy: Hybrid three-stream revenue model combining peer-to-peer marketplace, corporate partnerships, and platform-funded tasks for maximum revenue diversification and growth potential.

## System Architecture

### UI/UX Decisions
- **Design Principles**: Mobile-first responsive layout with a clean, professional teal-based color scheme. Features a Facebook-inspired design for a trustworthy interface.
- **Color Scheme**: Primary teal (#0d9488) with complementary emerald and slate accents. Uses 'Coins' icons visually while maintaining '$' for currency values.
- **Button Language**: Friendly and welcoming (e.g., "Join the Community", "Let's Get Started").
- **Typography**: Responsive typography using `clamp()` functions.
- **Navigation**: Mobile hamburger navigation with full-screen overlay and bottom navigation on authenticated pages.
- **Component Library**: Radix UI primitives with shadcn/ui for accessible and professional components.
- **Styling**: Tailwind CSS with custom color variables.

### Technical Implementations
- **Framework**: Next.js 15.4.6 with App Router.
- **Frontend**: React 18 with TypeScript.
- **Routing**: Wouter.
- **State Management**: TanStack Query.
- **Backend**: Node.js with Express.js.
- **File Uploads**: Multer middleware.
- **Database**: PostgreSQL with Drizzle ORM, hosted on Neon Database.
- **Authentication**: Supabase authentication with JWT tokens, PKCE flow, and email verification via SendGrid. Includes user verification and access control for monetization features.
- **Payment Processing**: Stripe for subscription billing, platform fees, and split payments. Escrow.com for high-value transactions.
- **Business Model**: Tiered subscription plans (Free, Pro, Premium), corporate sponsored tasks with ethical evaluation, and an achievement system with monetary rewards.
- **Task System**: Supports solo, community, barter, and self-care tasks with application questions, photo upload, progress tracking, and payment/tax compliance for barter.
- **Core Features**: Task marketplace, subscription tiers, corporate sponsorship portal, earnings dashboard, and mobile-first UI.

### System Design Choices
- Server-side rendering (SSR) via Next.js for performance.
- Relational schema for users, tasks, categories, completions, messages, and achievements.
- Robust security features including password hashing, account lockout, bearer token authentication, RLS database policies, and fraud detection.
- Comprehensive deployment configuration for multiple platforms.

## External Dependencies

### Core Runtime Dependencies
- `@neondatabase/serverless`: Serverless PostgreSQL client.
- `drizzle-orm`: Type-safe ORM for PostgreSQL.
- `express`: Web application framework.
- `multer`: File upload middleware.

### UI and Frontend Libraries
- `@radix-ui/***`: Accessible UI primitives.
- `@tanstack/react-query`: Server state management.
- `wouter`: Lightweight router.
- `tailwindcss`: Utility-first CSS framework.

### Third-Party Integrations
- **Stripe**: Payment processing for subscription billing and platform fees.
- **Escrow.com**: Transaction protection for high-value transactions.
- **SendGrid**: SMTP provider for Supabase authentication emails and business communications.
- **Twilio**: SMS notification system.
- **Google Analytics**: Platform analytics.
- **Supabase**: Authentication system.
- **Claude 4.0 Sonnet**: AI for content moderation and intelligent task generation.
- **PayPal**: Alternative payment processing.