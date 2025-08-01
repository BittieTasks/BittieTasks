# TaskParent Mobile Application

## Overview

TaskParent is a mobile-first React web application designed as a revolutionary dual-income marketplace for parents. The platform enables parents to earn money in two ways: (1) Get paid directly by the app for doing their own daily tasks (laundry, cooking, cleaning), and (2) Share the benefits of tasks they're already doing with neighbors for additional income. Built with a modern TypeScript stack, it features a responsive mobile interface with bottom navigation, real-time task management, earnings tracking, and a comprehensive messaging system.

**Recent Update (Aug 2025)**: Implemented groundbreaking dual earning model where parents get paid by the app for personal tasks AND can help neighbors for extra income. Added revolutionary Self-Care category where parents get paid for taking care of themselves (workouts, coffee dates, spa time). Features 100% self-sustaining app-based revenue model with earning potential up to $29,900/year. Phase 2 will add sponsored content opportunities for additional income.

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
- **Development Storage**: In-memory storage implementation for development/testing

### Database Schema Design
- **Users**: Profile management with earnings, ratings, and skills tracking
- **Task Categories**: Organized task types including revolutionary Self-Care category
- **Tasks**: Detailed task information including payment, difficulty, and requirements with self-care tasks for parent wellness
- **Task Completions**: Status tracking (pending/approved/rejected) with file attachments
- **Messages**: User-to-user communication system with read status
- **User Achievements**: Gamification system for user engagement

### Authentication and Authorization
- **Current Implementation**: Mock authentication with session-based user identification
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **Future-Ready**: Architecture prepared for JWT or OAuth integration

### Business Model and Monetization
- **Core Innovation**: Dual earning model for parents
  1. **App-Direct Payments**: Parents get paid directly by TaskParent for doing personal tasks (own laundry, cooking, cleaning)
  2. **Neighbor Payments**: Parents earn additional income by sharing tasks with neighbors who pay to join
- **100% Self-Sustaining Revenue Model**: Complete independence from external sponsors or brand partnerships
  - Platform service fee (15% of completed tasks, 10% for Pro members)
  - TaskParent Pro premium memberships ($9.99/month with enhanced features)
  - Corporate partnerships for employee benefit programs
  - Premium features and advanced business tools for power users
- **Earning Potential**: Up to $575/week ($29,900/year) combining both income streams
  - App payments: $180/week for personal tasks
  - Neighbor payments: $395/week for shared tasks
- **Future Enhancement**: Phase 2 will add sponsored content creation (+$250/week potential) for experienced parents
- **Unique Value Proposition**: "Get paid twice for what you're already doing" - app pays you, neighbors pay you too
- **Transparency Features**: Dedicated "How It Works" page explaining complete dual earning model
- **Payment Security**: $1M liability coverage and secure escrow payment processing
- **Market Advantage**: First platform to offer dual income streams from existing parent routines

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