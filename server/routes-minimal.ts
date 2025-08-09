import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Debug endpoint
  app.get('/debug', (req, res) => {
    res.json({
      message: 'Server is running correctly',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      port: process.env.PORT || 5000
    });
  });

  // Static test page to bypass Vite issues
  app.get('/test', (req, res) => {
    res.sendFile('/home/runner/workspace/static-test.html');
  });

  // Authentication app
  app.get('/auth', (req, res) => {
    res.sendFile('/home/runner/workspace/auth-page.html');
  });

  // Email debugging page
  app.get('/email-debug', (req, res) => {
    res.sendFile('/home/runner/workspace/auth-debug.html');
  });

  // Development bypass for authentication
  app.get('/platform', (req, res) => {
    res.sendFile('/home/runner/workspace/bypass-auth.html');
  });

  // Supabase setup guide
  app.get('/supabase-setup', (req, res) => {
    res.sendFile('/home/runner/workspace/supabase-setup-guide.html');
  });

  // Test email endpoint
  app.post('/api/send-test-email', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!process.env.SENDGRID_API_KEY) {
        return res.json({ 
          success: false, 
          error: 'SENDGRID_API_KEY not configured',
          details: 'SendGrid API key is missing from environment variables'
        });
      }
      
      // Use dynamic import for ES modules
      const sgMail = await import('@sendgrid/mail');
      sgMail.default.setApiKey(process.env.SENDGRID_API_KEY);
      
      const msg = {
        to: email,
        from: 'noreply@bittietasks.com',
        subject: 'BittieTasks - Email Test',
        text: 'This is a test email from BittieTasks to verify email delivery.',
        html: '<p>This is a test email from <strong>BittieTasks</strong> to verify email delivery.</p>'
      };
      
      await sgMail.default.send(msg);
      res.json({ 
        success: true, 
        message: 'Test email sent successfully via SendGrid',
        to: email
      });
      
    } catch (error) {
      console.error('SendGrid error:', error);
      res.json({ 
        success: false, 
        error: error.message,
        details: error.response?.body || 'Unknown SendGrid error'
      });
    }
  });

  // Mock API endpoints for development
  app.get('/api/auth/user', (req, res) => {
    res.json({ 
      id: 'dev-user-001', 
      email: 'admin@bittietasks.com',
      firstName: 'Admin',
      lastName: 'User',
      verified: true,
      totalEarnings: 1247.50,
      tasksCompleted: 23,
      activeReferrals: 5
    });
  });

  // Tasks API
  app.get('/api/tasks', (req, res) => {
    const mockTasks = [
      {
        id: '1',
        title: 'Soccer Practice Carpool',
        description: 'Share the ride to kids soccer practice. Split gas costs and earn together!',
        category: 'Sports Events',
        earningPotential: 25,
        maxParticipants: 4,
        currentParticipants: 2,
        duration: '2 hours',
        location: 'Community Sports Center',
        hostName: 'Sarah M.',
        status: 'open',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Grocery Shopping Group',
        description: 'Bulk shopping trip to warehouse store. Save money and earn cash!',
        category: 'Grocery Shopping',
        earningPotential: 35,
        maxParticipants: 6,
        currentParticipants: 3,
        duration: '3 hours',
        location: 'Costco Wholesale',
        hostName: 'Mike D.',
        status: 'open',
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Park Playdate Coordination',
        description: 'Organize group playdate at the park. Parents earn while kids play!',
        category: 'Playdates',
        earningPotential: 20,
        maxParticipants: 8,
        currentParticipants: 5,
        duration: '2 hours',
        location: 'Riverside Park',
        hostName: 'You',
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];
    res.json(mockTasks);
  });

  app.post('/api/tasks', (req, res) => {
    const newTask = {
      id: Date.now().toString(),
      ...req.body,
      hostName: 'You',
      currentParticipants: 0,
      status: 'open',
      createdAt: new Date().toISOString()
    };
    res.json(newTask);
  });

  app.post('/api/tasks/:id/join', (req, res) => {
    res.json({ success: true, message: 'Successfully joined task!' });
  });

  // Earnings API
  app.get('/api/earnings', (req, res) => {
    res.json({
      totalEarnings: 1247.50,
      thisMonth: 387.25,
      thisWeek: 142.75,
      today: 35.00,
      tasksCompleted: 23,
      activeReferrals: 5,
      monthlyGoal: 500.00,
      weeklyStreak: 4
    });
  });

  app.get('/api/earnings/transactions', (req, res) => {
    const mockTransactions = [
      {
        id: '1',
        type: 'task_completion',
        amount: 35.00,
        description: 'Completed: Soccer Practice Carpool',
        taskTitle: 'Soccer Practice Carpool',
        date: new Date().toISOString(),
        status: 'completed'
      },
      {
        id: '2',
        type: 'corporate_sponsorship',
        amount: 50.00,
        description: 'Sponsored Task Bonus',
        taskTitle: 'Community Garden Workshop',
        date: new Date(Date.now() - 86400000).toISOString(),
        status: 'completed'
      },
      {
        id: '3',
        type: 'referral_bonus',
        amount: 25.00,
        description: 'Referral Bonus - New Member',
        date: new Date(Date.now() - 172800000).toISOString(),
        status: 'processing'
      }
    ];
    res.json(mockTransactions);
  });

  // Achievements API
  app.get('/api/achievements', (req, res) => {
    const mockAchievements = [
      {
        id: '1',
        title: 'First Task',
        description: 'Complete your first shared task',
        earned: true,
        earnedDate: new Date(Date.now() - 604800000).toISOString()
      },
      {
        id: '2',
        title: 'Community Builder',
        description: 'Host 5 successful tasks',
        earned: true,
        earnedDate: new Date(Date.now() - 259200000).toISOString()
      },
      {
        id: '3',
        title: 'Earning Streak',
        description: 'Earn money for 7 consecutive days',
        earned: false,
        progress: 4,
        maxProgress: 7
      },
      {
        id: '4',
        title: 'Top Earner',
        description: 'Earn $1000 in a single month',
        earned: false,
        progress: 387,
        maxProgress: 1000
      }
    ];
    res.json(mockAchievements);
  });

  // Stripe Payment Processing
  app.post('/api/create-payment-intent', async (req, res) => {
    try {
      const stripe = await import('stripe');
      const stripeClient = new stripe.default(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2025-07-30.basil',
      });

      const { taskId, amount, participants } = req.body;
      
      // Calculate platform fee (10%)
      const platformFee = Math.round(amount * 0.10 * 100);
      const totalAmount = Math.round(amount * 100); // Convert to cents

      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: totalAmount,
        currency: 'usd',
        application_fee_amount: platformFee,
        metadata: {
          taskId,
          participants: JSON.stringify(participants),
          platformType: 'bittietasks'
        },
        description: `BittieTasks - Shared Task Payment`,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        platformFee: platformFee / 100
      });

    } catch (error: any) {
      console.error('Stripe payment error:', error);
      res.status(500).json({ 
        error: 'Payment setup failed',
        message: error.message 
      });
    }
  });

  // Split payment for task completion
  app.post('/api/complete-task-payment', async (req, res) => {
    try {
      const stripe = await import('stripe');
      const stripeClient = new stripe.default(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2025-07-30.basil',
      });

      const { taskId, participants, totalAmount } = req.body;
      const amountPerPerson = Math.round((totalAmount / participants.length) * 100);

      // Create payment intents for each participant
      const paymentPromises = participants.map(async (participant: any) => {
        return await stripeClient.paymentIntents.create({
          amount: amountPerPerson,
          currency: 'usd',
          metadata: {
            taskId,
            participantId: participant.id,
            earningType: 'task_completion'
          },
          description: `Earnings from shared task - ${participant.name}`,
        });
      });

      const payments = await Promise.all(paymentPromises);
      
      res.json({
        success: true,
        payments: payments.map(p => ({
          id: p.id,
          amount: p.amount / 100,
          clientSecret: p.client_secret
        }))
      });

    } catch (error: any) {
      console.error('Split payment error:', error);
      res.status(500).json({ 
        error: 'Payment distribution failed',
        message: error.message 
      });
    }
  });

  // Corporate sponsorship payment
  app.post('/api/sponsor-payment', async (req, res) => {
    try {
      const stripe = await import('stripe');
      const stripeClient = new stripe.default(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2025-07-30.basil',
      });

      const { sponsorId, taskId, sponsorshipAmount, communityBonus } = req.body;
      const totalAmount = Math.round((sponsorshipAmount + communityBonus) * 100);

      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: totalAmount,
        currency: 'usd',
        metadata: {
          sponsorId,
          taskId,
          sponsorshipAmount: sponsorshipAmount.toString(),
          communityBonus: communityBonus.toString(),
          paymentType: 'corporate_sponsorship'
        },
        description: `Corporate Sponsorship - Community Task Funding`,
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        totalAmount: totalAmount / 100
      });

    } catch (error: any) {
      console.error('Sponsorship payment error:', error);
      res.status(500).json({ 
        error: 'Sponsorship payment failed',
        message: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}