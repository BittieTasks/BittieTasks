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

  // Temporary auth user endpoint
  app.get('/api/auth/user', (req, res) => {
    res.json({ 
      id: 'test-user', 
      email: 'test@example.com',
      message: 'Temporary user for debugging'
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}