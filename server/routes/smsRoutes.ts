import { Router } from 'express';
import smsService from '../services/smsService';

const router = Router();

// Get SMS service status
router.get('/status', (req, res) => {
  const status = smsService.getStatus();
  res.json({
    smsEnabled: status.enabled,
    fromNumber: status.fromNumber,
    features: [
      'task_notifications',
      'payment_alerts',
      'security_notifications',
      'verification_codes',
      'task_reminders'
    ]
  });
});

// Send test SMS (for development/admin use)
router.post('/test', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const result = await smsService.sendTestMessage(phoneNumber);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Test SMS sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('SMS test error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send test SMS' 
    });
  }
});

// Send verification code
router.post('/verify', async (req, res) => {
  try {
    const { phoneNumber, code } = req.body;
    
    if (!phoneNumber || !code) {
      return res.status(400).json({ error: 'Phone number and code are required' });
    }

    const result = await smsService.sendVerificationCode(phoneNumber, code);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Verification code sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('Verification SMS error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send verification code' 
    });
  }
});

// Send task notification
router.post('/task-notification', async (req, res) => {
  try {
    const { phoneNumber, taskTitle, status } = req.body;
    
    if (!phoneNumber || !taskTitle || !status) {
      return res.status(400).json({ 
        error: 'Phone number, task title, and status are required' 
      });
    }

    const result = await smsService.sendTaskNotification(phoneNumber, taskTitle, status);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Task notification sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('Task notification SMS error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send task notification' 
    });
  }
});

// Send payment notification
router.post('/payment-notification', async (req, res) => {
  try {
    const { phoneNumber, amount, type } = req.body;
    
    if (!phoneNumber || !amount || !type) {
      return res.status(400).json({ 
        error: 'Phone number, amount, and type are required' 
      });
    }

    if (!['received', 'sent'].includes(type)) {
      return res.status(400).json({ 
        error: 'Type must be either "received" or "sent"' 
      });
    }

    const result = await smsService.sendPaymentNotification(phoneNumber, amount, type);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Payment notification sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('Payment notification SMS error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send payment notification' 
    });
  }
});

// Send security alert
router.post('/security-alert', async (req, res) => {
  try {
    const { phoneNumber, alertType } = req.body;
    
    if (!phoneNumber || !alertType) {
      return res.status(400).json({ 
        error: 'Phone number and alert type are required' 
      });
    }

    const result = await smsService.sendSecurityAlert(phoneNumber, alertType);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Security alert sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error: any) {
    console.error('Security alert SMS error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send security alert' 
    });
  }
});

export default router;