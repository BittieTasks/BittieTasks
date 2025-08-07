import { Router } from 'express';
import { sendEmail, sendWelcomeEmail, sendPasswordResetEmail, sendUpgradeConfirmationEmail } from '../services/emailService';

const router = Router();

// Send welcome email
router.post('/welcome', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    const success = await sendWelcomeEmail(email, name);
    
    if (success) {
      res.json({
        success: true,
        message: 'Welcome email sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send welcome email'
      });
    }
  } catch (error: any) {
    console.error('Welcome email error:', error);
    res.status(500).json({ error: 'Failed to send welcome email' });
  }
});

// Send password reset email
router.post('/password-reset', async (req, res) => {
  try {
    const { email, resetToken } = req.body;
    
    if (!email || !resetToken) {
      return res.status(400).json({ error: 'Email and reset token are required' });
    }

    const success = await sendPasswordResetEmail(email, resetToken);
    
    if (success) {
      res.json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send password reset email'
      });
    }
  } catch (error: any) {
    console.error('Password reset email error:', error);
    res.status(500).json({ error: 'Failed to send password reset email' });
  }
});

// Send upgrade confirmation email
router.post('/upgrade-confirmation', async (req, res) => {
  try {
    const { email, name, planName } = req.body;
    
    if (!email || !name || !planName) {
      return res.status(400).json({ error: 'Email, name, and plan name are required' });
    }

    const success = await sendUpgradeConfirmationEmail(email, name, planName);
    
    if (success) {
      res.json({
        success: true,
        message: 'Upgrade confirmation email sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send upgrade confirmation email'
      });
    }
  } catch (error: any) {
    console.error('Upgrade confirmation email error:', error);
    res.status(500).json({ error: 'Failed to send upgrade confirmation email' });
  }
});

// Send custom email
router.post('/send', async (req, res) => {
  try {
    const { to, from, subject, text, html } = req.body;
    
    if (!to || !from || !subject) {
      return res.status(400).json({ 
        error: 'To, from, and subject are required' 
      });
    }

    const success = await sendEmail({ to, from, subject, text, html });
    
    if (success) {
      res.json({
        success: true,
        message: 'Email sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send email'
      });
    }
  } catch (error: any) {
    console.error('Email sending error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Get email service status
router.get('/status', (req, res) => {
  const enabled = !!process.env.SENDGRID_API_KEY;
  
  res.json({
    enabled,
    features: enabled ? [
      'welcome_emails',
      'password_reset',
      'upgrade_confirmations',
      'custom_messaging',
      'html_templates'
    ] : [],
    fromAddress: enabled ? 'noreply@bittietasks.com' : null
  });
});

export default router;