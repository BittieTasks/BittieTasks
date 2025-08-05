import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import type { User } from '@shared/schema';

// Rate limiters for verification endpoints
export const phoneVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: {
    message: "Too many verification attempts, please try again later"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const emailVerificationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes  
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    message: "Too many email verification attempts, please try again later"
  }
});

/**
 * Generate secure 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate secure token for password reset, etc.
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phoneNumber: string): boolean {
  // International phone number regex (supports +1, +44, etc.)
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Validate uploaded document
 */
export function validateDocumentUpload(file: Express.Multer.File): { valid: boolean; error?: string } {
  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: "File size must be less than 5MB" };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.mimetype)) {
    return { valid: false, error: "Only JPG, PNG, and PDF files are allowed" };
  }

  // Check if file exists and is readable
  if (!fs.existsSync(file.path)) {
    return { valid: false, error: "File upload failed" };
  }

  return { valid: true };
}

/**
 * Analyze document for fraud indicators (simplified version)
 */
export async function analyzeDocumentFraud(file: Express.Multer.File): Promise<{
  suspicious: boolean;
  riskScore: number;
  reasons: string[];
}> {
  const reasons: string[] = [];
  let riskScore = 0;

  try {
    // Basic file analysis
    const stats = fs.statSync(file.path);
    
    // Check for unusually small file size (may indicate low quality scan)
    if (stats.size < 50000) { // Less than 50KB
      reasons.push("Unusually small file size");
      riskScore += 15;
    }

    // Check for very large file size (may indicate uncompressed or manipulated)
    if (stats.size > 3 * 1024 * 1024) { // Greater than 3MB
      reasons.push("Unusually large file size");
      riskScore += 10;
    }

    // In production, this would include:
    // - OCR text extraction and validation
    // - Metadata analysis for digital manipulation
    // - Face detection and matching
    // - Security features verification (watermarks, etc.)
    // - Database checks against known fraudulent documents
    
    // Simulate some fraud detection for demo
    const filename = file.originalname.toLowerCase();
    if (filename.includes('fake') || filename.includes('test') || filename.includes('sample')) {
      reasons.push("Suspicious filename patterns");
      riskScore += 50;
    }

  } catch (error) {
    console.error('Document analysis error:', error);
    reasons.push("File analysis failed");
    riskScore += 25;
  }

  return {
    suspicious: riskScore > 30,
    riskScore: Math.min(riskScore, 100),
    reasons
  };
}

/**
 * Calculate user trust score based on verification status
 */
export function calculateTrustScore(user: Partial<User>): number {
  let score = 0;

  // Email verification (20 points)
  if (user.isEmailVerified) score += 20;

  // Phone verification (25 points)
  if (user.isPhoneVerified) score += 25;

  // Identity verification (30 points)
  if (user.isIdentityVerified) score += 30;

  // Background check (25 points)
  if (user.isBackgroundChecked) score += 25;

  // Account age bonus (max 10 points)
  if (user.createdAt) {
    const accountAgeMonths = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30);
    score += Math.min(10, Math.floor(accountAgeMonths * 2));
  }

  // Penalize high risk scores
  const riskPenalty = (user.riskScore || 0) / 2;
  score = Math.max(0, score - riskPenalty);

  return Math.min(100, Math.round(score));
}

/**
 * Middleware to require specific verification level
 */
export function requireVerification(level: 'email' | 'phone' | 'identity' | 'background') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // In a real implementation, you would fetch user from database
      // For now, we'll use a simplified check
      const user = { 
        isEmailVerified: true, 
        isPhoneVerified: true, 
        isIdentityVerified: false, 
        isBackgroundChecked: false 
      };

      switch (level) {
        case 'email':
          if (!user.isEmailVerified) {
            return res.status(403).json({ 
              message: "Email verification required",
              requiredVerification: 'email'
            });
          }
          break;
        case 'phone':
          if (!user.isPhoneVerified) {
            return res.status(403).json({ 
              message: "Phone verification required",
              requiredVerification: 'phone'
            });
          }
          break;
        case 'identity':
          if (!user.isIdentityVerified) {
            return res.status(403).json({ 
              message: "Identity verification required",
              requiredVerification: 'identity'
            });
          }
          break;
        case 'background':
          if (!user.isBackgroundChecked) {
            return res.status(403).json({ 
              message: "Background check required",
              requiredVerification: 'background'
            });
          }
          break;
      }

      next();
    } catch (error) {
      console.error('Verification middleware error:', error);
      res.status(500).json({ message: "Verification check failed" });
    }
  };
}

/**
 * Anti-bot behavior analysis
 */
export function analyzeBehaviorPatterns(behaviorData: any): {
  score: number;
  isHuman: boolean;
  flags: string[];
} {
  const flags: string[] = [];
  let score = 100; // Start with perfect score

  // Check mouse movement patterns
  if (behaviorData.mouseMovements) {
    const movements = behaviorData.mouseMovements;
    if (movements.length < 10) {
      flags.push("Insufficient mouse movement data");
      score -= 15;
    }
    
    // Check for perfectly straight lines (bot indicator)
    const straightLines = movements.filter((m: any) => 
      m.deltaX === 0 || m.deltaY === 0 || Math.abs(m.deltaX) === Math.abs(m.deltaY)
    ).length;
    
    if (straightLines > movements.length * 0.5) {
      flags.push("Suspicious mouse movement patterns");
      score -= 25;
    }
  }

  // Check keystroke patterns
  if (behaviorData.keystrokes) {
    const keystrokes = behaviorData.keystrokes;
    if (keystrokes.length > 0) {
      const intervals = keystrokes.map((k: any, i: number) => 
        i > 0 ? k.timestamp - keystrokes[i-1].timestamp : 0
      ).filter((interval: number) => interval > 0);
      
      // Check for unnaturally consistent timing
      const avgInterval = intervals.reduce((a: number, b: number) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((sum: number, interval: number) => 
        sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
      
      if (variance < 10) { // Very low variance indicates bot
        flags.push("Unnaturally consistent typing patterns");
        score -= 30;
      }
    }
  }

  // Check session duration
  if (behaviorData.sessionDuration) {
    if (behaviorData.sessionDuration < 30) { // Less than 30 seconds
      flags.push("Suspiciously short session duration");
      score -= 20;
    }
  }

  return {
    score: Math.max(0, score),
    isHuman: score >= 70,
    flags
  };
}

/**
 * Device fingerprinting for consistency checks
 */
export function generateDeviceFingerprint(deviceData: any): string {
  const components = [
    deviceData.userAgent,
    deviceData.screen?.width + 'x' + deviceData.screen?.height,
    deviceData.timezone,
    deviceData.language,
    deviceData.platform,
    deviceData.cookieEnabled ? 'cookies' : 'nocookies',
    deviceData.doNotTrack ? 'dnt' : 'nodnt'
  ].filter(Boolean);

  return crypto
    .createHash('sha256')
    .update(components.join('|'))
    .digest('hex')
    .substring(0, 16); // Use first 16 characters
}