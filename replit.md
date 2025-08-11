# BittieTasks Platform

## Overview

BittieTasks is a community-based platform that enables parents to turn daily tasks into earning opportunities through task sharing, collaboration, and sponsored activities. The platform connects neighbors and community members to share responsibilities like school pickups, meal planning, and household organization while creating income streams. Users can participate in solo tasks, collaborative shared tasks, or self-care activities with optional accountability partners.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with App Router for server-side rendering and routing
- **Styling**: Tailwind CSS with custom design system featuring bold gradients and modern UI components
- **Component Library**: Radix UI primitives for accessible, unstyled components
- **State Management**: React Context for authentication state and TanStack Query for server state
- **Animation**: Framer Motion for smooth transitions and interactive elements
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Supabase Auth for user management and session handling
- **File Storage**: Google Cloud Storage for task-related media and documents
- **Payment Processing**: Stripe integration for subscription management and task payouts
- **API Design**: Next.js API routes for server-side functionality

### Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon Database for production scalability
- **Schema Management**: Drizzle ORM with migration system for database versioning
- **File Storage**: Google Cloud Storage for user uploads and media assets
- **Session Storage**: Supabase handles user sessions and authentication tokens

### Authentication and Authorization
- **Provider**: Supabase Auth with email/password and social login support
- **Session Management**: Automatic token refresh and persistent sessions
- **Route Protection**: Client-side and server-side authentication guards
- **User Roles**: Subscription-based access control (free, pro, premium tiers)

### External Dependencies
- **Database**: Neon PostgreSQL for reliable, serverless database hosting
- **Authentication**: Supabase for complete authentication infrastructure
- **Payments**: Stripe for subscription billing and task payout processing
- **Storage**: Google Cloud Storage for scalable file management
- **Deployment**: Vercel for automatic deployments with GitHub integration
- **Email**: Supabase handles transactional emails for auth flows
- **Analytics**: Built-in tracking system for user engagement metrics

The platform follows a modern JAMstack architecture with strong emphasis on accessibility, type safety, and user experience. The bold design system creates an engaging interface while maintaining professional functionality for the parent community target audience.