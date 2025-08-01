# TaskParent Mobile Application

## Overview

TaskParent is a mobile-first React web application designed as a revolutionary "monetize your daily routine" marketplace. The platform enables parents to earn money by sharing the benefits of tasks they're already doing for themselves - like meal prepping, grocery shopping, organizing, and childcare. Built with a modern TypeScript stack, it features a responsive mobile interface with bottom navigation, real-time task management, earnings tracking, and a comprehensive messaging system.

**Recent Update (Aug 2025)**: Pivoted to the groundbreaking model where parents monetize their existing daily routines rather than taking on new tasks. Added comprehensive monetization strategy, business model transparency, and sponsored tasks feature for guaranteed income.

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
- **Task Categories**: Organized task types with icons and color coding
- **Tasks**: Detailed task information including payment, difficulty, and requirements
- **Task Completions**: Status tracking (pending/approved/rejected) with file attachments
- **Messages**: User-to-user communication system with read status
- **User Achievements**: Gamification system for user engagement

### Authentication and Authorization
- **Current Implementation**: Mock authentication with session-based user identification
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **Future-Ready**: Architecture prepared for JWT or OAuth integration

### Business Model and Monetization
- **Core Innovation**: Parents monetize daily tasks they're already doing (meal prep, grocery runs, childcare)
- **Revenue Streams**: Multiple sustainable income sources to ensure consistent parent payments
  - Platform service fee (15% of completed tasks)
  - Premium memberships ($9.99/month with enhanced features)
  - Corporate partnerships for employee services
  - Insurance and trust services
- **Unique Value Proposition**: "Get paid for what you're already doing" - no additional time commitment required
- **Transparency Features**: Dedicated "How It Works" page explaining revenue model
- **Payment Security**: $1M liability coverage and secure escrow payment processing
- **Market Advantage**: First platform to monetize existing parent routines rather than creating new work

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