import twilio from 'twilio';

export interface SMSNotification {
  to: string;
  message: string;
  type: 'task_update' | 'payment' | 'security' | 'reminder' | 'verification';
}

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class SMSService {
  private client: twilio.Twilio | null = null;
  private fromNumber: string | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !phoneNumber) {
      console.warn('Twilio credentials not configured. SMS notifications disabled.');
      return;
    }

    try {
      this.client = twilio(accountSid, authToken);
      this.fromNumber = phoneNumber;
      this.isConfigured = true;
      console.log('✓ Twilio SMS service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Twilio client:', error);
    }
  }

  async sendSMS(notification: SMSNotification): Promise<SMSResult> {
    if (!this.isConfigured || !this.client || !this.fromNumber) {
      return {
        success: false,
        error: 'SMS service not configured'
      };
    }

    try {
      // Format phone number - ensure it has country code
      const formattedPhone = this.formatPhoneNumber(notification.to);
      
      const message = await this.client.messages.create({
        body: notification.message,
        from: this.fromNumber,
        to: formattedPhone
      });

      console.log(`SMS sent successfully: ${message.sid} to ${formattedPhone}`);
      
      return {
        success: true,
        messageId: message.sid
      };
    } catch (error: any) {
      console.error('SMS sending failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // If it's a 10-digit US number, add +1
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    
    // If it already has country code but no +, add it
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    
    // If it's already formatted correctly
    if (phoneNumber.startsWith('+')) {
      return phoneNumber;
    }
    
    // Default: assume it needs +1 (US)
    return `+1${digits}`;
  }

  // Specific notification types
  async sendTaskNotification(phoneNumber: string, taskTitle: string, status: string): Promise<SMSResult> {
    const message = `BittieTasks Update: Your task "${taskTitle}" is now ${status}. Check the app for details.`;
    
    return this.sendSMS({
      to: phoneNumber,
      message,
      type: 'task_update'
    });
  }

  async sendPaymentNotification(phoneNumber: string, amount: number, type: 'received' | 'sent'): Promise<SMSResult> {
    const action = type === 'received' ? 'received' : 'processed';
    const message = `BittieTasks: Payment of $${amount} ${action} successfully. View details in your earnings section.`;
    
    return this.sendSMS({
      to: phoneNumber,
      message,
      type: 'payment'
    });
  }

  async sendSecurityAlert(phoneNumber: string, alertType: string): Promise<SMSResult> {
    const message = `BittieTasks Security Alert: ${alertType}. If this wasn't you, please secure your account immediately.`;
    
    return this.sendSMS({
      to: phoneNumber,
      message,
      type: 'security'
    });
  }

  async sendVerificationCode(phoneNumber: string, code: string): Promise<SMSResult> {
    const message = `Your BittieTasks verification code is: ${code}. This code expires in 10 minutes.`;
    
    return this.sendSMS({
      to: phoneNumber,
      message,
      type: 'verification'
    });
  }

  async sendTaskReminder(phoneNumber: string, taskTitle: string, timeUntil: string): Promise<SMSResult> {
    const message = `BittieTasks Reminder: Your task "${taskTitle}" starts in ${timeUntil}. Don't forget!`;
    
    return this.sendSMS({
      to: phoneNumber,
      message,
      type: 'reminder'
    });
  }

  async sendWelcomeMessage(phoneNumber: string, firstName: string): Promise<SMSResult> {
    const message = `Welcome to BittieTasks, ${firstName}! Start earning money by sharing household tasks with your neighbors. Reply STOP to unsubscribe.`;
    
    return this.sendSMS({
      to: phoneNumber,
      message,
      type: 'verification'
    });
  }

  // Test SMS functionality
  async sendTestMessage(phoneNumber: string): Promise<SMSResult> {
    const message = `BittieTasks SMS Test: Your notifications are working perfectly! 📱`;
    
    return this.sendSMS({
      to: phoneNumber,
      message,
      type: 'verification'
    });
  }

  isEnabled(): boolean {
    return this.isConfigured;
  }

  getStatus(): { enabled: boolean; fromNumber: string | null } {
    return {
      enabled: this.isConfigured,
      fromNumber: this.fromNumber ? this.fromNumber.replace(/\d(?=\d{4})/g, '*') : null // Mask number for security
    };
  }
}

export const smsService = new SMSService();
export default smsService;