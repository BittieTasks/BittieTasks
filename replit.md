# BittieTasks - Neighborhood Task Sharing Platform

## Overview

BittieTasks is a community-focused platform that transforms daily tasks into earning opportunities by enabling neighbors to share activities, split costs, and collaborate. The platform offers multiple task types including solo platform-funded tasks, peer-to-peer community tasks, barter exchanges, and corporate sponsorships. Built with Next.js and TypeScript, it features a modern component-based architecture with real-time capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application uses Next.js 15 with the App Router pattern for modern React development. The component architecture follows a modular design with reusable UI components built on top of Radix UI primitives and styled with Tailwind CSS. The codebase includes specialized components for task management, user authentication, payment processing, and real-time messaging.

**Key Frontend Decisions:**
- **Next.js App Router**: Chosen for its file-based routing, server components, and enhanced performance capabilities
- **Tailwind CSS**: Selected for rapid UI development with a utility-first approach and consistent design system
- **Radix UI**: Provides accessible, unstyled components that can be customized while maintaining accessibility standards
- **TypeScript**: Ensures type safety throughout the application and improves developer experience

### Authentication & Authorization
The platform implements a custom authentication system built on Supabase Auth with server-side session management. The authentication flow includes email verification, secure session handling, and role-based access control.

**Key Authentication Decisions:**
- **Supabase Auth**: Chosen for its secure authentication primitives and built-in email verification
- **Custom Auth Provider**: Wraps Supabase client to provide application-specific authentication state management
- **Middleware-based Protection**: Uses Next.js middleware to protect routes and manage session persistence
- **Cookie-based Sessions**: Implements secure session management with HttpOnly cookies for enhanced security

### Database & ORM
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema is designed to support multiple task types, user verification levels, and payment tracking.

**Key Database Decisions:**
- **PostgreSQL**: Selected for its reliability, ACID compliance, and advanced features like JSON support
- **Drizzle ORM**: Provides type-safe database queries with excellent TypeScript integration
- **Schema-first Design**: Database schema drives application type definitions for consistency

### Payment Processing
Stripe integration handles all payment flows including task payouts, subscription management, and fee processing. The system supports multiple payment scenarios with transparent fee structures.

**Key Payment Decisions:**
- **Stripe**: Chosen for its comprehensive payment processing capabilities and developer-friendly API
- **Fee Transparency**: Different fee structures for various task types (3% solo, 7% community, 0% barter, 15% corporate)
- **Automatic Payouts**: Platform-funded tasks provide immediate payment upon verification

### State Management
The application uses TanStack Query for server state management combined with React's built-in state for UI state. This approach provides efficient caching, background updates, and optimistic updates.

**Key State Management Decisions:**
- **TanStack Query**: Handles server state, caching, and synchronization with automatic background updates
- **React Context**: Used sparingly for authentication state and theme management
- **Local Component State**: Preferred for UI-specific state to maintain component isolation

### Real-time Features
WebSocket connections enable real-time messaging and task updates. The system gracefully handles connection failures and provides offline capabilities.

**Key Real-time Decisions:**
- **WebSocket Provider**: Custom implementation for managing real-time connections
- **Graceful Degradation**: Application functions without real-time features if WebSocket fails
- **Message Queuing**: Handles offline message delivery when connection is restored

## External Dependencies

### Core Services
- **Supabase**: Primary authentication and database hosting service providing user management and PostgreSQL database
- **Stripe**: Payment processing platform handling all financial transactions, subscriptions, and payouts
- **Vercel**: Deployment platform providing serverless hosting, edge functions, and global CDN
- **SendGrid**: Email delivery service for transactional emails including verification and notifications

### Development Tools
- **Drizzle Kit**: Database migration and schema management tool for PostgreSQL operations
- **Google Cloud Storage**: File storage service for user-uploaded verification photos and task assets
- **TanStack Query**: Server state management library providing caching and synchronization

### UI Libraries
- **Radix UI**: Component primitives providing accessible, unstyled UI components as foundation elements
- **Tailwind CSS**: Utility-first CSS framework for rapid styling and consistent design system
- **Lucide React**: Icon library providing consistent iconography throughout the application

### Monitoring & Analytics
- **Next.js Analytics**: Built-in performance monitoring and user analytics for application insights
- **Error Boundaries**: Custom error handling system for graceful failure management
- **Development Tools**: ESLint and TypeScript for code quality and type safety enforcement