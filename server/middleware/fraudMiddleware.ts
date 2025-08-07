import { Request, Response, NextFunction } from 'express';
import { fraudDetection } from '../services/fraudDetection';

interface AuthenticatedRequest extends Request {
  user?: any;
}

// Middleware to check for fraudulent activity
export const fraudCheckMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Only check authenticated users
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;
    const requestInfo = {
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      path: req.path,
      method: req.method
    };

    // Perform fraud analysis
    const fraudCheck = await fraudDetection.analyzeUser(userId, requestInfo);
    
    // Log the fraud check
    await fraudDetection.logFraudAttempt(fraudCheck, `${req.method} ${req.path}`);

    // Block if high risk
    if (fraudCheck.blocked) {
      console.log(`🚫 Blocking high-risk user ${userId}: ${fraudCheck.factors.join(', ')}`);
      return res.status(403).json({
        message: 'Access denied due to security concerns',
        riskScore: fraudCheck.riskScore,
        timestamp: fraudCheck.timestamp
      });
    }

    // Add fraud info to request for downstream use
    req.fraudCheck = fraudCheck;
    
    next();
  } catch (error) {
    console.error('Fraud detection middleware error:', error);
    // Don't block on fraud detection errors
    next();
  }
};

// Middleware for high-value operations (payments, withdrawals)
export const highValueFraudCheck = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId = req.user.id;
    const requestInfo = {
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      path: req.path,
      method: req.method,
      amount: req.body?.amount || 0
    };

    const fraudCheck = await fraudDetection.analyzeUser(userId, requestInfo);
    
    // Lower threshold for high-value operations
    const HIGH_VALUE_THRESHOLD = 50;
    if (fraudCheck.riskScore >= HIGH_VALUE_THRESHOLD) {
      console.log(`🚫 Blocking high-value operation for user ${userId}: Risk ${fraudCheck.riskScore}%`);
      await fraudDetection.logFraudAttempt(fraudCheck, `HIGH_VALUE_${req.method} ${req.path}`);
      
      return res.status(403).json({
        message: 'Transaction requires additional verification',
        riskScore: fraudCheck.riskScore,
        requiresVerification: true
      });
    }

    req.fraudCheck = fraudCheck;
    next();
  } catch (error) {
    console.error('High-value fraud check error:', error);
    next();
  }
};

// Middleware to track suspicious patterns
export const trackSuspiciousActivity = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Track rapid requests from same user
    const userId = req.user?.id;
    if (userId) {
      const now = Date.now();
      const windowMs = 60000; // 1 minute
      const maxRequests = 20; // Max 20 requests per minute
      
      if (!req.app.locals.userRequestTracking) {
        req.app.locals.userRequestTracking = new Map();
      }
      
      const userRequests = req.app.locals.userRequestTracking.get(userId) || [];
      const recentRequests = userRequests.filter((timestamp: number) => now - timestamp < windowMs);
      
      if (recentRequests.length >= maxRequests) {
        console.log(`⚠️  Rate limit exceeded for user ${userId}: ${recentRequests.length} requests/minute`);
        return res.status(429).json({
          message: 'Too many requests. Please slow down.',
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }
      
      recentRequests.push(now);
      req.app.locals.userRequestTracking.set(userId, recentRequests);
    }
    
    next();
  } catch (error) {
    console.error('Suspicious activity tracking error:', error);
    next();
  }
};

// Declare module augmentation for TypeScript
declare global {
  namespace Express {
    interface Request {
      fraudCheck?: any;
    }
  }
}