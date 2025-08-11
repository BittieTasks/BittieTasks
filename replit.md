# BittieTasks Mobile Application

## Overview
BittieTasks is a mobile-first React web application that serves as a dual-income marketplace for parents. Its primary purpose is to enable parents to earn money by sharing daily tasks with neighbors and to monetize routine parent activities. The platform facilitates community-based earnings, where neighbors pay to join activities, and also includes features for self-care tasks with optional accountability partners. Key capabilities include real-time task management, earnings tracking, a comprehensive messaging system, and gamified wellness achievements. The business model incorporates an advertising-based revenue model with affiliate marketing integration, an ethical partnership matching algorithm for corporate partners, a comprehensive bartering system for skill/service exchange, and an advertising management system with ethical evaluation.

## User Preferences
Preferred communication style: Senior programming engineer level technical communication.
Development workflow: Uses Replit as development workspace, GitHub for version control, and Vercel for production deployment.

## System Architecture

### UI/UX Decisions
- **Design Principles**: Mobile-first responsive layout with clean, professional teal-based color scheme. Clean, Facebook-inspired design with minimal styling and trustworthy interface.
- **Color Scheme**: Primary teal (#0d9488) with complementary emerald and slate accents. Uses Coins icons instead of DollarSign icons for visual elements while maintaining $ currency symbols for actual amounts.
- **Button Language**: Friendly, welcoming language - "Join the Community", "Welcome Back", "Let's Get Started", "Explore Opportunities".
- **Typography**: Responsive typography using `clamp()` functions.
- **Navigation**: Mobile hamburger navigation with full-screen overlay and bottom navigation on authenticated pages.
- **Component Library**: Radix UI primitives with shadcn/ui for accessible and professional components.
- **Styling**: Tailwind CSS with custom color variables and teal theme.

### Technical Implementations
- **Framework**: Next.js 15.4.6 with App Router.
- **Frontend**: React 18 with TypeScript.
- **Routing**: Wouter.
- **State Management**: TanStack Query.
- **Backend**: Node.js with Express.js.
- **File Uploads**: Multer middleware for file handling.
- **Database**: PostgreSQL with Drizzle ORM, hosted on Neon Database.
- **Authentication**: Supabase authentication with JWT tokens, email verification via SendGrid, PKCE authentication flow. Includes user verification and access control for monetization features.
- **Payment Processing**: Stripe for subscription billing, platform fees, and split payments. Escrow.com for high-value transactions.
- **Business Model**:
    - Tiered subscription plans: Free (10% fee), Pro ($9.99/month, 7% fee), Premium ($19.99/month, 5% fee).
    - Corporate sponsored tasks (25-50% higher payouts) with an automated ethical evaluation system.
    - Achievement system with monetary rewards.
- **Task System**: Supports solo, community, barter, and self-care tasks with application questions, photo upload, progress tracking, and payment processing. Barter transactions include tax compliance tracking.
- **Core Features**: Task marketplace, subscription tiers, corporate sponsorship portal, earnings dashboard, and comprehensive mobile-first UI.

### System Design Choices
- Server-side rendering (SSR) via Next.js for reliable styling and performance.
- Relational schema for users, tasks, categories, completions, messages, and achievements.
- Robust security features: Password hashing, account lockout, bearer token authentication, RLS database policies, and fraud detection.
- Comprehensive deployment configuration for multiple platforms (Vercel, Netlify, Railway, Docker).

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

### Development and Build Tools
- `vite`: Fast build tool (used during development transition).
- `typescript`: Static type checking.
- `esbuild`: Fast bundler for production.
- `drizzle-kit`: Database migration and schema management.

### Third-Party Integrations
- **Stripe**: Payment processing for subscription billing and platform fees.
- **Escrow.com**: Transaction protection for high-value transactions.
- **SendGrid**: SMTP provider for Supabase authentication emails and business communications.
- **Twilio**: SMS notification system.
- **Google Analytics**: Platform analytics.
- **Supabase**: Authentication system.
- **Claude 4.0 Sonnet**: AI for content moderation and intelligent task generation.
- **PayPal**: Alternative payment processing.