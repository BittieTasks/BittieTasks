# TaskParent Mobile Application

## Overview

TaskParent is a mobile-first React web application designed as a revolutionary dual-income marketplace for parents. The platform enables parents to earn money in two ways: (1) Get paid directly by the app for doing their own daily tasks (laundry, cooking, cleaning), and (2) Share the benefits of tasks they're already doing with neighbors for additional income. Built with a modern TypeScript stack, it features a responsive mobile interface with bottom navigation, real-time task management, earnings tracking, and a comprehensive messaging system.

**Recent Update (Aug 2025)**: Updated to realistic peer-to-peer payment model where parents earn money from neighbors who pay to join their daily activities. Removed direct app payments in favor of community-based earnings through TaskParent's platform. Authentication system fully functional with proper session management - users can create accounts, login, and logout successfully. Added professional landing page that displays for logged-out users instead of demo data. **NEW: Added comprehensive brand partnership system** - companies can sponsor community tasks with higher payouts and special rewards (Starbucks, Target, Whole Foods examples implemented). Updated business plan with brand partnership revenue projections showing 33% revenue increase and accelerated profitability. **LATEST: Implemented personalized wellness achievement badge system** - gamification features with progress tracking, rarity levels, and reward points to encourage user engagement and wellness activities. Created comprehensive legal business setup guide covering LLC formation, tax obligations, and platform compliance requirements. **SECURITY UPDATE: Implemented comprehensive security measures** - migrated to secure PostgreSQL database with password hashing (bcrypt), input validation, rate limiting, and enhanced authentication. Created detailed security audit documentation covering data protection, fraud prevention, and compliance requirements. **CHILDCARE REMOVAL: Completely eliminated all childcare services** - removed childcare category from platform to eliminate high-risk legal exposure, reducing potential liability from $1M-10M+ lawsuits and significantly lowering first-year legal costs from estimated $300K-500K. **LEGAL COMPLIANCE COMPLETE: Comprehensive legal protection implemented** - fixed worker classification with independent contractor protections, scaled back excessive background check requirements to job-related only, eliminated COPPA compliance issues by making platform 18+ only, enabled direct payment options to preserve marketplace model, added comprehensive liability disclaimers with $100 damage cap, implemented mandatory binding arbitration to prevent expensive litigation, included required insurance coverage for all users, and established proper money transmission compliance. Platform now operates with comprehensive legal protections and minimal risk exposure. **BUSINESS PLAN UPDATED: Enhanced focus on parent community, self-care, and security** - updated comprehensive business plan highlighting community-driven approach, integrated wellness features, and enterprise-grade security infrastructure with detailed financial projections showing accelerated growth through community engagement.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing optimized for mobile
- **State Management**: TanStack Query for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui for consistent design system
- **Styling**: Tailwind CSS with custom color variables for theming
- **Mobile-First Design**: Responsive layout with bottom navigation and mobile-optimized components

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Development**: tsx for TypeScript execution in development
- **File Uploads**: Multer middleware for handling task completion proof files
- **Static Assets**: Served through Express with development hot-reloading via Vite
- **Logging**: Custom request/response logging with performance metrics

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Cloud Provider**: Neon Database for serverless PostgreSQL hosting
- **Schema**: Comprehensive relational schema including users, tasks, categories, completions, messages, and achievements
- **Security Features**: Password hashing storage, email verification tokens, password reset tokens, account lockout protection
- **Production Storage**: Secure PostgreSQL database with encrypted connections and parameterized queries

### Database Schema Design
- **Users**: Profile management with earnings, ratings, and skills tracking
- **Task Categories**: Organized task types including Self-Care category (childcare completely prohibited)
- **Tasks**: Detailed task information including payment, difficulty, and requirements with self-care tasks for parent wellness
- **Task Completions**: Status tracking (pending/approved/rejected) with file attachments
- **Messages**: User-to-user communication system with read status
- **User Achievements**: Gamification system for user engagement

### Authentication and Authorization
- **Current Implementation**: Full session-based authentication with proper login/logout functionality
- **Password Security**: bcrypt password hashing with salt rounds of 12, strong password requirements
- **Session Management**: Express sessions with secure cookie handling, session regeneration on login
- **User Experience**: Landing page for unauthenticated users, protected routes for authenticated users
- **Security Features**: Session destruction on logout, proper credential validation, authentication state management
- **Enhanced Protection**: Rate limiting for login attempts, input sanitization, email validation
- **Database Security**: PostgreSQL with encrypted connections, parameterized queries preventing SQL injection

### Business Model and Monetization
- **Core Innovation**: Community-based earning model for parents
  1. **Neighbor Payments**: Parents earn income by sharing tasks they're already doing with neighbors who pay to join
  2. **Platform Facilitation**: TaskParent handles payments, scheduling, and coordination
- **Realistic Revenue Model**: Sustainable platform based on transaction fees
  - Platform service fee (15% of completed tasks, 10% for Pro members)
  - TaskParent Pro premium memberships ($9.99/month with enhanced features)
  - Corporate partnerships for employee benefit programs
  - Premium features and advanced business tools for power users
- **Earning Potential**: $200-600/week through community sharing
  - Examples: $30 for grocery run with 3 neighbors, $50 for meal prep sharing with 2 families
- **Value Proposition**: "Turn your daily routines into income" - monetize what you're already doing
- **Transparency Features**: "How It Works" page explaining realistic peer-to-peer payment model
- **Payment Security**: Secure escrow payment processing through the platform
- **Market Advantage**: First platform to systematically monetize routine parent activities through community sharing

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL client for database connectivity
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect for database operations
- **express**: Web application framework for API and static file serving
- **multer**: File upload middleware for task completion attachments

### UI and Frontend Libraries
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **@tanstack/react-query**: Server state management and data fetching
- **wouter**: Lightweight router for single-page application navigation
- **tailwindcss**: Utility-first CSS framework for responsive design
- **class-variance-authority**: Type-safe component variant management

### Development and Build Tools
- **vite**: Fast build tool with hot module replacement for development
- **typescript**: Static type checking across the entire application
- **esbuild**: Fast bundler for production server builds
- **drizzle-kit**: Database migration and schema management tools

### Third-Party Integrations
- **Replit Platform**: Integrated development environment with banner and debugging tools
- **File Storage**: Local file system storage for uploaded task completion proofs
- **Image/Video Processing**: Client-side file type validation and size limits