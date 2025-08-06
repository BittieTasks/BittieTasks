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
**January 2025:**
- ✅ **Custom Domain Live**: bittietasks.com successfully deployed and verified via Cloudflare DNS
- ✅ **Database Operational**: PostgreSQL with 6 task categories and demo tasks populated
- ✅ **API Endpoints Active**: All core endpoints responding correctly (categories, tasks, users)
- ✅ **Human Verification System**: Comprehensive anti-bot measures and user verification active
- ✅ **Security Infrastructure**: Rate limiting, authentication, and fraud prevention operational
- ⏳ **Payment Integration**: Awaiting Stripe API keys for full payment processing
- ⏳ **LSP Diagnostics**: Minor type inconsistencies being resolved, server stable

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
- **File Storage**: Local file system for uploaded proofs.