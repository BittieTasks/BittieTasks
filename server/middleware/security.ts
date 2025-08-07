import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Rate limiting configurations
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    error: 'Too many login attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: {
    error: 'Too many file uploads, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Recursively sanitize all string inputs
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove potentially dangerous characters
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/[<>]/g, '')
        .trim();
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

// CSRF protection middleware
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return next();
  }

  const token = req.headers['x-csrf-token'] as string;
  const sessionToken = (req.session as any)?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  next();
};

// Generate CSRF token
export const generateCSRFToken = (req: Request, res: Response, next: NextFunction) => {
  if (!(req.session as any)?.csrfToken) {
    (req.session as any).csrfToken = crypto.randomBytes(32).toString('hex');
  }
  next();
};

// Secure file upload validation
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
    return next();
  }

  const files = Array.isArray(req.files) ? req.files : [req.files];
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  for (const file of files) {
    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        error: 'Invalid file type. Only images and videos are allowed.',
      });
    }

    // Check file size
    if (file.size > maxSize) {
      return res.status(400).json({
        error: 'File too large. Maximum size is 5MB.',
      });
    }

    // Check for malicious file names
    if (file.originalname.includes('..') || file.originalname.includes('/')) {
      return res.status(400).json({
        error: 'Invalid file name.',
      });
    }
  }

  next();
};

// Session security middleware
export const sessionSecurity = (req: Request, res: Response, next: NextFunction) => {
  // Regenerate session ID on login to prevent session fixation
  if (req.path === '/api/auth/login' && req.method === 'POST') {
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regeneration error:', err);
      }
      next();
    });
  } else {
    next();
  }
};

// Security audit logging
interface SecurityEvent {
  userId?: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  details?: any;
}

const securityLog: SecurityEvent[] = [];

export const logSecurityEvent = (event: SecurityEvent) => {
  const logEntry = {
    ...event,
    timestamp: new Date().toISOString(),
  };
  
  securityLog.push(logEntry);
  console.log('Security Event:', logEntry);
  
  // In production, send to security monitoring service
  // e.g., Datadog, Splunk, or custom security dashboard
};

export const auditMiddleware = (action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function (data) {
      const success = res.statusCode < 400;
      
      logSecurityEvent({
        userId: (req.session as any)?.userId,
        action,
        ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        success,
        details: success ? null : { statusCode: res.statusCode, data },
      });
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Password strength validation - simplified to 6+ characters
export const validatePasswordStrength = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters long' };
  }
  
  // Check against common passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', '111111', '123123', 'admin', 'letmein'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    return { isValid: false, message: 'Password is too common. Please choose a stronger password' };
  }
  
  return { isValid: true };
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation and formatting
export const validateAndFormatPhone = (phone: string): { isValid: boolean; formatted?: string; message?: string } => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Check if it's a valid US phone number (10 digits)
  if (digits.length === 10) {
    const formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    return { isValid: true, formatted };
  }
  
  // Check if it's a valid US phone number with country code (11 digits starting with 1)
  if (digits.length === 11 && digits.startsWith('1')) {
    const formatted = `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    return { isValid: true, formatted };
  }
  
  return { isValid: false, message: 'Invalid phone number format' };
};

// IP address validation and geolocation check
export const validateIPAddress = async (ip: string): Promise<{ isValid: boolean; isSuspicious: boolean; country?: string }> => {
  // Basic IP format validation
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
    return { isValid: false, isSuspicious: true };
  }
  
  // Check against known malicious IP ranges (simplified)
  const suspiciousRanges = [
    '10.0.0.0/8',     // Private network
    '172.16.0.0/12',  // Private network
    '192.168.0.0/16', // Private network
  ];
  
  // In production, integrate with IP geolocation and threat intelligence services
  // e.g., MaxMind GeoIP2, IPQualityScore, VirusTotal
  
  return { isValid: true, isSuspicious: false, country: 'US' };
};

export default {
  loginLimiter,
  apiLimiter,
  uploadLimiter,
  securityHeaders,
  sanitizeInput,
  csrfProtection,
  generateCSRFToken,
  validateFileUpload,
  sessionSecurity,
  auditMiddleware,
  logSecurityEvent,
  validatePasswordStrength,
  validateEmail,
  validateAndFormatPhone,
  validateIPAddress,
};