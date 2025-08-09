import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn('SendGrid API key not configured. Email notifications disabled.');
}

const mailService = new MailService();
if (process.env.SENDGRID_API_KEY) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✓ SendGrid email service initialized successfully');
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured, skipping email');
    return false;
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || '',
      html: params.html || '',
    });
    console.log(`Email sent successfully to ${params.to}`);
    return true;
  } catch (error: any) {
    console.error('SendGrid email error:', error);
    if (error.response?.body?.errors) {
      console.error('SendGrid error details:', error.response.body.errors);
    }
    return false;
  }
}

export async function sendVerificationEmail(userEmail: string, userName: string, verificationToken: string): Promise<boolean> {
  console.log(`Attempting to send verification email to: ${userEmail} for user: ${userName}`);
  
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured, creating mock verification email');
    const mockBaseUrl = process.env.NODE_ENV === 'production' ? 'https://bittietasks.com' : 'http://localhost:5000';
    console.log(`Mock verification URL: ${mockBaseUrl}/verify-email?token=${verificationToken}`);
    console.log(`Mock email would be addressed to: ${userName} at ${userEmail}`);
    return true; // Return true so signup continues
  }

  // Use appropriate URL based on environment to avoid SSL issues
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://bittietasks.com' 
    : `http://localhost:5000`;
  const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
  
  const verificationHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; line-height: 1.6; }
        .button { background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
        .warning { background: #fff3cd; border-left: 4px solid #ffeaa7; padding: 12px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName},</h2>
          <p>Welcome to BittieTasks! To complete your registration and start earning money from everyday tasks, please verify your email address.</p>
          
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
          
          <div class="warning">
            <p><strong>Important:</strong> You need to verify your email before you can:</p>
            <ul>
              <li>Create tasks and earn money</li>
              <li>Join activities in your area</li>
              <li>Receive important notifications</li>
              <li>Access all platform features</li>
            </ul>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
          
          <p>This verification link expires in 24 hours for security reasons.</p>
          
          <p>Best regards,<br>The BittieTasks Team</p>
        </div>
        <div class="footer">
          <p>BittieTasks - Little Tasks, Real Income</p>
          <p>If you didn't create this account, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Try different sender addresses to find one that works
  const possibleSenders = [
    'support@bittietasks.com',
    'noreply@bittietasks.com',
    'hello@bittietasks.com'
  ];

  // Try each sender until one works
  for (const sender of possibleSenders) {
    console.log(`Attempting to send verification email from: ${sender}`);
    
    const success = await sendEmail({
      to: userEmail,
      from: sender,
      subject: 'Verify Your Email - BittieTasks Account',
      html: verificationHtml,
      text: `Welcome to BittieTasks, ${userName}! Please verify your email by visiting: ${verificationUrl}`
    });

    if (success) {
      console.log(`✅ Verification email sent successfully from: ${sender}`);
      return true;
    }
  }

  console.log('❌ All sender addresses failed - domain verification needed');
  return false;
}

export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured, skipping welcome email');
    return false;
  }

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

  return sendEmail({
    to: userEmail,
    from: 'support@bittietasks.com',
    subject: 'Welcome to BittieTasks - Start Earning Today!',
    html: welcomeHtml,
    text: `Welcome to BittieTasks, ${userName}! Start earning money from everyday tasks. Visit https://bittietasks.com to get started.`
  });
}

export async function sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured, skipping password reset email');
    return false;
  }

  const resetHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; line-height: 1.6; }
        .button { background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Reset Your BittieTasks Password</h2>
          <p>You requested a password reset for your BittieTasks account. Click the button below to create a new password:</p>
          
          <a href="https://bittietasks.com/reset-password?token=${resetToken}" class="button">Reset Password</a>
          
          <p>If you didn't request this reset, please ignore this email. Your password will remain unchanged.</p>
          <p>This link will expire in 24 hours for security reasons.</p>
          
          <p>Best regards,<br>The BittieTasks Team</p>
        </div>
        <div class="footer">
          <p>BittieTasks - Little Tasks, Real Income</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    from: 'noreply@bittietasks.com',
    subject: 'BittieTasks Password Reset',
    html: resetHtml
  });
}

export async function sendUpgradeConfirmationEmail(userEmail: string, userName: string, planName: string): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured, skipping upgrade confirmation email');
    return false;
  }

  const upgradeHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; line-height: 1.6; }
        .button { background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to ${planName}!</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName},</h2>
          <p>Congratulations! Your BittieTasks account has been upgraded to ${planName}. You now have access to premium features that will help you earn even more.</p>
          
          <h3>Your new benefits include:</h3>
          <ul>
            <li>✓ Priority task placement</li>
            <li>✓ Advanced analytics dashboard</li>
            <li>✓ Higher earning limits</li>
            <li>✓ Premium customer support</li>
          </ul>
          
          <a href="https://bittietasks.com/dashboard" class="button">Access Premium Features</a>
          
          <p>Thank you for supporting BittieTasks and our community of parents!</p>
          
          <p>Best regards,<br>The BittieTasks Team</p>
        </div>
        <div class="footer">
          <p>BittieTasks - Little Tasks, Real Income</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: userEmail,
    from: 'noreply@bittietasks.com',
    subject: `Welcome to BittieTasks ${planName}!`,
    html: upgradeHtml
  });
}