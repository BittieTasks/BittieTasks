import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import crypto from "crypto";
import rateLimit from "express-rate-limit";

// Phone verification system
export const phoneVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 verification attempts per windowMs
  message: { error: 'Too many verification attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Email verification system
export const emailVerificationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 2, // Limit each IP to 2 email verification attempts per windowMs
  message: { error: 'Too many email verification attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Identity verification middleware
export const requireVerification = (level: 'email' | 'phone' | 'identity' | 'full') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Check verification levels
      switch (level) {
        case 'email':
          if (!user.isEmailVerified) {
            return res.status(403).json({ 
              message: "Email verification required",
              verificationRequired: "email"
            });
          }
          break;
        
        case 'phone':
          if (!user.isEmailVerified || !user.isPhoneVerified) {
            return res.status(403).json({ 
              message: "Phone verification required",
              verificationRequired: "phone"
            });
          }
          break;
        
        case 'identity':
          if (!user.isEmailVerified || !user.isPhoneVerified || !user.isIdentityVerified) {
            return res.status(403).json({ 
              message: "Identity verification required",
              verificationRequired: "identity"
            });
          }
          break;
        
        case 'full':
          if (!user.isEmailVerified || !user.isPhoneVerified || !user.isIdentityVerified || !user.isBackgroundChecked) {
            return res.status(403).json({ 
              message: "Full verification required",
              verificationRequired: "full"
            });
          }
          break;
      }

      next();
    } catch (error) {
      console.error("Verification middleware error:", error);
      res.status(500).json({ message: "Verification check failed" });
    }
  };
};

// Generate secure verification codes
export const generateVerificationCode = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// Generate secure tokens
export const generateSecureToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Validate phone number format
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?1?[2-9]\d{2}[2-9]\d{2}\d{4}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

// Check for suspicious activity patterns
export const detectSuspiciousActivity = async (userId: string, activity: {
  type: 'login' | 'task_creation' | 'payment' | 'message';
  ip?: string;
  userAgent?: string;
  metadata?: any;
}): Promise<boolean> => {
  // In a real implementation, this would check against ML models
  // For now, we'll implement basic rule-based detection
  
  const recentActivity = await storage.getUserActivity(userId, 24); // Last 24 hours
  
  // Check for rapid task creation (potential spam)
  if (activity.type === 'task_creation') {
    const recentTasks = recentActivity.filter(a => a.type === 'task_creation');
    if (recentTasks.length > 10) {
      return true; // Suspicious: too many tasks created
    }
  }
  
  // Check for multiple login attempts from different IPs
  if (activity.type === 'login' && activity.ip) {
    const recentLogins = recentActivity.filter(a => a.type === 'login');
    const uniqueIPs = new Set(recentLogins.map(a => a.ip).filter(Boolean));
    if (uniqueIPs.size > 5) {
      return true; // Suspicious: logins from many different IPs
    }
  }
  
  return false;
};

// Fraud prevention for high-value actions
export const fraudPreventionCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check user risk score
    if (user.riskScore && user.riskScore > 75) {
      return res.status(403).json({ 
        message: "Account under review for suspicious activity",
        requiresReview: true
      });
    }

    // Check for account lockout
    if (user.accountLocked) {
      return res.status(403).json({ 
        message: "Account temporarily locked",
        contactSupport: true
      });
    }

    // Detect suspicious activity
    const isSuspicious = await detectSuspiciousActivity(userId, {
      type: req.path.includes('task') ? 'task_creation' : 'payment',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    if (isSuspicious) {
      // Log suspicious activity but don't block (yet)
      console.warn(`Suspicious activity detected for user ${userId}: ${req.path}`);
      await storage.logSuspiciousActivity(userId, {
        type: 'suspicious_behavior',
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date()
      });
    }

    next();
  } catch (error) {
    console.error("Fraud prevention check error:", error);
    next(); // Don't block on error, but log it
  }
};

// Advanced document verification helpers
export const validateDocumentUpload = (file: Express.Multer.File): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (!allowedTypes.includes(file.mimetype)) {
    return { valid: false, error: 'Invalid file type. Please upload JPG, PNG, or PDF files only.' };
  }

  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'File too large. Please upload files smaller than 5MB.' };
  }

  // Minimum file size check (prevents tiny/empty files)
  if (file.size < 10 * 1024) { // 10KB minimum
    return { valid: false, error: 'File too small. Document images must be at least 10KB.' };
  }

  // Basic filename validation (prevent path traversal)
  if (!/^[a-zA-Z0-9._-]+$/.test(file.originalname)) {
    return { valid: false, error: 'Invalid filename. Please use only letters, numbers, dots, underscores, and dashes.' };
  }

  // Check for suspicious file extensions in filename
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.php', '.js', '.html'];
  const filename = file.originalname.toLowerCase();
  if (suspiciousExtensions.some(ext => filename.includes(ext))) {
    return { valid: false, error: 'Suspicious file detected. Please upload only document images or PDFs.' };
  }

  return { valid: true };
};

// Enhanced document analysis for fraud detection
export const analyzeDocumentFraud = async (file: Express.Multer.File): Promise<{ 
  suspicious: boolean; 
  reasons: string[];
  riskScore: number; 
}> => {
  const reasons: string[] = [];
  let riskScore = 0;

  // Check file metadata for manipulation
  const creationTime = file.buffer ? await getImageMetadata(file.buffer) : null;
  
  // Flag very recent creation times (possible fresh edits)
  if (creationTime && Date.now() - creationTime.getTime() < 24 * 60 * 60 * 1000) {
    reasons.push("Document created/modified within last 24 hours");
    riskScore += 20;
  }

  // Check file size patterns (manipulated images often have unusual sizes)
  const aspectRatio = await getImageDimensions(file.path);
  if (aspectRatio && (aspectRatio < 0.5 || aspectRatio > 3.0)) {
    reasons.push("Unusual document aspect ratio");
    riskScore += 15;
  }

  // Basic EXIF data analysis for digital manipulation
  const hasExifData = await checkExifData(file.path);
  if (!hasExifData) {
    reasons.push("Missing or stripped EXIF data (possible digital manipulation)");
    riskScore += 10;
  }

  // Check for common photo editing software signatures
  const editingSoftware = await detectEditingSoftware(file.path);
  if (editingSoftware.length > 0) {
    reasons.push(`Document processed with: ${editingSoftware.join(', ')}`);
    riskScore += 25;
  }

  return {
    suspicious: riskScore > 30,
    reasons,
    riskScore
  };
};

// Helper functions for document analysis
async function getImageMetadata(buffer: Buffer): Promise<Date | null> {
  // In production, use libraries like 'exif-parser' or 'piexifjs'
  try {
    // Simulate EXIF date extraction
    return new Date(); // Placeholder - implement with actual EXIF parsing
  } catch {
    return null;
  }
}

async function getImageDimensions(filePath: string): Promise<number | null> {
  // In production, use 'image-size' library
  try {
    // Simulate dimension analysis
    return 1.5; // Placeholder - implement with actual image analysis
  } catch {
    return null;
  }
}

async function checkExifData(filePath: string): Promise<boolean> {
  // In production, check for presence of EXIF data
  return Math.random() > 0.3; // Placeholder - implement actual EXIF check
}

async function detectEditingSoftware(filePath: string): Promise<string[]> {
  // In production, analyze file for signatures of editing software
  const editingSoftware = ['Photoshop', 'GIMP', 'Paint.NET', 'Canva'];
  return Math.random() > 0.7 ? [editingSoftware[Math.floor(Math.random() * editingSoftware.length)]] : [];
}

// Trust score calculation
export const calculateTrustScore = (user: any): number => {
  let score = 0;

  // Email verification (20 points)
  if (user.isEmailVerified) score += 20;
  
  // Phone verification (25 points)
  if (user.isPhoneVerified) score += 25;
  
  // Identity verification (30 points)
  if (user.isIdentityVerified) score += 30;
  
  // Background check (15 points)
  if (user.isBackgroundChecked) score += 15;
  
  // Account age (up to 10 points)
  const accountAgeMonths = user.createdAt ? 
    Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 0;
  score += Math.min(accountAgeMonths * 2, 10);

  return Math.min(score, 100);
};