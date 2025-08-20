# BittieTasks - Community Task Marketplace

A transformative neighborhood task marketplace leveraging intelligent matching algorithms to connect community needs with business opportunities through a dynamic, user-centric platform.

## 🚀 Live Production Platform

BittieTasks is an active production platform processing real money transactions for everyday adult tasks. Users earn cash completing simple activities like washing dishes, doing laundry, and grocery shopping.

### Key Features

- **25 Everyday Solo Tasks**: Universal adult activities accessible to all skill levels ($3-20 range)
- **Daily Limits**: 5 completions per task type with 24-hour completion windows (cost control during initial phase)
- **Transparent Fees**: 3% platform fee on solo tasks with clear earnings breakdown
- **Real-time Availability**: Live tracking of daily limits with midnight reset
- **Stripe Payment System**: Live payment processing for subscriptions and task completions
- **Mobile-first Design**: Responsive interface optimized for mobile task completion

## 💳 Payment & Revenue System

### Task Categories & Fees
- **Solo Tasks**: 3% platform fee (wash dishes $8 → user gets $7.76)
- **Community Tasks**: 7% platform fee
- **Barter Exchange**: 0% fee (community building)
- **Corporate Tasks**: 15% platform fee

### Subscription Tiers
- **Pro Plan**: $9.99/month - Enhanced features and priority support
- **Premium Plan**: $19.99/month - All features plus advanced analytics

### Daily Cost Control
- Maximum 125 task completions daily (25 tasks × 5 each)
- Automatic expiration after 24 hours
- Real-time limit enforcement prevents overspending

## 🏗 Technical Stack

- **Frontend**: Next.js 15 with React 18 and TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **Backend**: Next.js API routes with serverless functions
- **Database**: PostgreSQL via Supabase with Row Level Security
- **Authentication**: Supabase Auth with phone verification
- **Payments**: Stripe (live mode) with webhook processing
- **Deployment**: Vercel with automatic GitHub deployment

## 📱 Task Categories

### Household Tasks (8 tasks)
- Wash dishes, laundry, vacuuming, bathroom cleaning, kitchen deep clean, organize closet, dust surfaces, mop floors

### Errands (5 tasks) 
- Grocery shopping, pharmacy pickup, post office, dry cleaning, library returns

### Health & Wellness (6 tasks)
- Walk/jog, meal prep, meditation, stretch routine, hydration tracking, sleep optimization

### Personal Care (3 tasks)
- Skincare routine, hair care, wardrobe organization

### Productive (3 tasks)
- Email inbox organization, workspace setup, daily planning

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Supabase account
- Stripe account

### Environment Setup
```bash
# Database
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Stripe (Test or Live)
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
VITE_STRIPE_PUBLIC_KEY=pk_test_... or pk_live_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_PREMIUM_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Installation
```bash
git clone https://github.com/yourusername/bittietasks.git
cd bittietasks
npm install
npm run dev
```

### Database Setup
```bash
# Push schema to database
npm run db:push

# Optional: Open database studio
npm run db:studio
```

## 📈 Current Status

### ✅ Operational Systems
- Payment processing with live Stripe integration
- User authentication and profile management
- Task application and completion workflows  
- Daily limit enforcement and availability tracking
- Dashboard with earnings and task history
- Mobile-responsive design across all pages

### 🎯 Business Metrics
- **Target Market**: Adults seeking flexible earning opportunities
- **Revenue Model**: Platform fees (3-15%) + subscription revenue
- **Cost Control**: Daily limits during initial growth phase
- **Scalability**: Removal of limits upon revenue sustainability

## 🔧 Deployment

### GitHub Integration
1. Push code to GitHub main branch
2. Set up environment variables in GitHub Secrets
3. Connect to Vercel/Railway for automatic deployment
4. Update Stripe webhook URL to production domain

### Production Checklist
- [ ] Stripe live keys configured
- [ ] All environment variables set
- [ ] Webhook endpoint updated
- [ ] Database migrations applied
- [ ] Payment flows tested
- [ ] Mobile responsiveness verified

## 📊 Architecture

### Database Schema
- `users` - User profiles and authentication
- `tasks` - Task definitions and metadata
- `task_participants` - User task applications and completions
- `transactions` - Payment records and earnings tracking
- `subscriptions` - User subscription management

### API Routes
- `/api/auth/*` - Authentication endpoints
- `/api/solo-tasks/*` - Task management and applications
- `/api/dashboard` - User dashboard data
- `/api/webhooks/stripe` - Payment webhook processing
- `/api/subscriptions/*` - Subscription management

## 💡 Business Vision

BittieTasks aims to create a transparent, community-driven marketplace where neighbors help neighbors while earning fair compensation. The platform emphasizes:

- **Radical Transparency**: Clear fee structures and earnings breakdown
- **Community Trust**: Verified task completions and user reputation
- **Fair Market Pricing**: Realistic compensation for everyday activities
- **Sustainable Growth**: Cost controls during initial revenue generation

## 📞 Support

For technical issues or business inquiries, please create an issue in this repository or contact the development team.

---

**BittieTasks** - Transforming everyday activities into earning opportunities.