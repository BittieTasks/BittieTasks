# BittieTasks Mobile Application

## Overview
BittieTasks is a mobile-first React web application designed as a dual-income marketplace for parents. It enables parents to earn money by sharing daily tasks with neighbors for additional income. The platform focuses on community-based earnings, where neighbors pay to join activities, facilitated by BittieTasks. It features a responsive mobile interface, real-time task management, earnings tracking, a comprehensive messaging system, and personalized wellness achievement badges for gamification. The business model has evolved to include an advertising-based revenue model with affiliate marketing integration, allowing parents to earn commissions on recommended products. Comprehensive legal protections are in place, ensuring compliance and minimizing risk.

**NEW: Bartering System** - The platform now includes a comprehensive bartering system where parents can trade skills, services, and time with neighbors without cash transactions. This includes proper tax documentation for IRS compliance, fair market value tracking, and seamless integration with the existing platform.

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
- **Static Assets**: Served via Express, hot-reloading with Vite

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Cloud Provider**: Neon Database
- **Schema**: Relational schema for users, tasks, categories, completions, messages, and achievements.
- **Security**: Password hashing, email verification, password reset tokens, account lockout.

### Database Schema Design
- **Users**: Profile management, earnings, ratings, skills.
- **Task Categories**: Organized task types including Self-Care.
- **Tasks**: Detailed task information, including self-care tasks for parent wellness.
- **Task Completions**: Status tracking with file attachments.
- **Messages**: User-to-user communication.
- **User Achievements**: Gamification system.

### Authentication and Authorization
- **Implementation**: Full session-based authentication with login/logout.
- **Password Security**: bcrypt hashing with salt rounds of 12, strong password requirements.
- **Session Management**: Express sessions with secure cookie handling.
- **Security Features**: Rate limiting for login attempts, input sanitization, email validation, session destruction on logout.

### Business Model and Monetization
- **Core Innovation**: Community-based earning model.
  - Parents earn income by sharing tasks with neighbors who pay to join.
- **Revenue Streams**:
  - **Advertising**: Native feed ads, local service providers, affiliate marketing.
  - **Affiliate Marketing**: Task-based product recommendations with 3-12% commission.
- **Payment Infrastructure**: Enterprise-grade processing system.
  - **Stripe Connect**: Split payments, automatic platform fee collection.
  - **Escrow.com Integration**: Protection for high-value transactions ($100+).
  - **Subscription Billing**: Automated recurring revenue for Pro/Premium plans.
- **Value Proposition**: Monetizing routine parent activities.

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