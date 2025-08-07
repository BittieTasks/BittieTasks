import { MailService } from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (!SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
  const welcomeHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; line-height: 1.6; }
        .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to BittieTasks!</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName},</h2>
          <p>Welcome to BittieTasks - where little tasks create real income! We're excited to have you join our community of parents earning money through everyday activities.</p>
          
          <h3>What you can do now:</h3>
          <ul>
            <li>✓ Create tasks and invite neighbors to join</li>
            <li>✓ Browse local activities in your area</li>
            <li>✓ Start earning money from routine household tasks</li>
            <li>✓ Build your community reputation</li>
          </ul>
          
          <a href="https://bittietasks.com" class="button">Start Earning Today</a>
          
          <h3>Need help getting started?</h3>
          <p>Check out our quick start guide or reach out to our support team. We're here to help you succeed!</p>
          
          <p>Best regards,<br>The BittieTasks Team</p>
        </div>
        <div class="footer">
          <p>BittieTasks - Little Tasks, Real Income</p>
          <p>Visit us at <a href="https://bittietasks.com">bittietasks.com</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: userEmail,
    from: 'welcome@bittietasks.com',
    subject: 'Welcome to BittieTasks - Start Earning Today!',
    html: welcomeHtml,
    text: `Welcome to BittieTasks, ${userName}! Start earning money from everyday tasks. Visit https://bittietasks.com to get started.`
  });
}

export async function sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<boolean> {
  const resetUrl = `https://bittietasks.com/reset-password?token=${resetToken}`;
  
  const resetHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; line-height: 1.6; }
        .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your BittieTasks password. If you made this request, click the button below to create a new password:</p>
          
          <a href="${resetUrl}" class="button">Reset My Password</a>
          
          <div class="warning">
            <strong>Important:</strong> This link will expire in 1 hour for security reasons.
          </div>
          
          <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
          
          <p>For security, never share this email with anyone.</p>
          
          <p>Best regards,<br>The BittieTasks Security Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: userEmail,
    from: 'security@bittietasks.com',
    subject: 'Reset Your BittieTasks Password',
    html: resetHtml,
    text: `Reset your BittieTasks password: ${resetUrl} (expires in 1 hour)`
  });
}

export async function sendUpgradeConfirmationEmail(userEmail: string, userName: string, planName: string): Promise<boolean> {
  const upgradeHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; line-height: 1.6; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .feature-list { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to ${planName}!</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName},</h2>
          
          <div class="success">
            <strong>Congratulations!</strong> Your upgrade to ${planName} is now active.
          </div>
          
          <h3>Your new benefits include:</h3>
          <div class="feature-list">
            ${planName === 'Premium' ? `
              <ul>
                <li>✓ Keep 80% of task earnings (vs 75% Basic)</li>
                <li>✓ Priority customer support</li>
                <li>✓ Advanced analytics dashboard</li>
                <li>✓ Higher task visibility</li>
                <li>✓ Exclusive premium tasks</li>
              </ul>
            ` : `
              <ul>
                <li>✓ Keep 85% of task earnings</li>
                <li>✓ VIP customer support</li>
                <li>✓ Advanced analytics & insights</li>
                <li>✓ Maximum task visibility</li>
                <li>✓ Exclusive high-value tasks</li>
                <li>✓ Early access to new features</li>
              </ul>
            `}
          </div>
          
          <p>Start maximizing your earnings right away! Your new plan benefits are active immediately.</p>
          
          <p>Questions? Our support team is here to help you make the most of your ${planName} membership.</p>
          
          <p>Best regards,<br>The BittieTasks Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: userEmail,
    from: 'billing@bittietasks.com',
    subject: `Welcome to ${planName} - Your Upgrade is Active!`,
    html: upgradeHtml,
    text: `Congratulations ${userName}! Your ${planName} upgrade is now active. Start earning more today!`
  });
}