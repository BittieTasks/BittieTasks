# BittieTasks - Community Task Marketplace

A comprehensive community-driven skill exchange platform that transforms local talents into monetizable opportunities through intelligent task matching and engaging user experiences.

## 🚀 Features

- **Task Marketplace**: Full-featured marketplace with task creation, discovery, and participation
- **Subscription Tiers**: Three-tier monetization (Free/Pro/Premium) with 10%/7%/5% platform fees
- **Corporate Sponsorship**: Ethical partner evaluation system with sponsored tasks
- **Earnings Dashboard**: Comprehensive income tracking and goal setting
- **Authentication**: Supabase integration with email verification
- **Payment Processing**: Stripe integration for subscriptions and task payments
- **Mobile-First Design**: Responsive design optimized for mobile devices

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **UI Components**: Radix UI with shadcn/ui
- **Styling**: Tailwind CSS with custom gradients
- **Animations**: Framer Motion

## 📦 Installation

1. Clone the repository:
\`\`\`bash
git clone https://github.com/yourusername/bittietasks.git
cd bittietasks
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Configure your environment variables in \`.env.local\`:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
DATABASE_URL=your_database_url
\`\`\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables Required:

- \`NEXT_PUBLIC_SUPABASE_URL\`
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
- \`STRIPE_SECRET_KEY\`
- \`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY\`
- \`DATABASE_URL\`

## 💳 Payment Configuration

### Stripe Setup:
1. Create a Stripe account at https://dashboard.stripe.com
2. Get your API keys from the developers section
3. Configure webhook endpoints for payment processing

### Supabase Setup:
1. Create a project at https://supabase.com
2. Set up authentication with email verification
3. Configure database tables using the provided schema

## 📱 Features Overview

### For Users:
- Browse and apply for local tasks
- Create tasks for community help
- Track earnings and set goals
- Achievement system with rewards
- Mobile-optimized experience

### For Task Creators:
- Post tasks with detailed requirements
- Set fair compensation rates
- Manage applications and participants
- Track task completion

### For Platform:
- Automated fee collection (10%/7%/5% based on tier)
- Corporate partnership integration
- Ethical sponsor evaluation
- Comprehensive analytics

## 🏗 Architecture

The platform follows a modern full-stack architecture:

- **Frontend**: Server-side rendered React with Next.js
- **Backend**: Express.js API with PostgreSQL database
- **Authentication**: Supabase for user management
- **Payments**: Stripe for secure transactions
- **Storage**: PostgreSQL with Drizzle ORM for type safety

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For support, email support@bittietasks.com or create an issue on GitHub.