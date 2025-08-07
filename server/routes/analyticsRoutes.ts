import { Router } from 'express';
import { analytics } from '../services/analyticsService';
import { fraudDetection } from '../services/fraudDetection';

const router = Router();

// Track analytics events from frontend
router.post('/track', async (req, res) => {
  try {
    const { eventName, properties } = req.body;
    const userId = (req as any).user?.id;
    
    // Perform fraud check on high-value events
    if (['payment_completed', 'subscription_upgrade', 'task_completed'].includes(eventName)) {
      const fraudCheck = await fraudDetection.analyzeUser(userId || 'anonymous', {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        path: req.path,
        method: req.method
      });
      
      if (fraudCheck.blocked) {
        return res.status(403).json({ 
          message: 'Event tracking blocked due to security concerns',
          riskScore: fraudCheck.riskScore 
        });
      }
    }
    
    await analytics.trackEvent(eventName, userId, {
      ...properties,
      userAgent: req.headers['user-agent'],
      url: req.headers.referer || req.url,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// Get user-specific analytics
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days as string) || 30;
    
    // Only allow users to see their own analytics or admin access
    const currentUserId = (req as any).user?.id;
    const isAdmin = (req as any).user?.isAdmin;
    
    if (userId !== currentUserId && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const metrics = await analytics.getUserMetrics(userId, days);
    res.json(metrics);
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ error: 'Failed to get user analytics' });
  }
});

// Get platform analytics (admin only)
router.get('/platform', async (req, res) => {
  try {
    const isAdmin = (req as any).user?.isAdmin;
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const days = parseInt(req.query.days as string) || 7;
    const metrics = await analytics.getPlatformMetrics(days);
    res.json(metrics);
  } catch (error) {
    console.error('Platform analytics error:', error);
    res.status(500).json({ error: 'Failed to get platform analytics' });
  }
});

// Export analytics data (admin only)
router.get('/export', async (req, res) => {
  try {
    const isAdmin = (req as any).user?.isAdmin;
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const startDate = req.query.start ? new Date(req.query.start as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.end ? new Date(req.query.end as string) : new Date();
    
    const events = await analytics.exportEvents(startDate, endDate);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=analytics-export-${startDate.toISOString().split('T')[0]}-to-${endDate.toISOString().split('T')[0]}.json`);
    res.json(events);
  } catch (error) {
    console.error('Analytics export error:', error);
    res.status(500).json({ error: 'Failed to export analytics data' });
  }
});

export default router;