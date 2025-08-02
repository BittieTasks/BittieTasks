import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// COPPA Compliance - Age Verification Middleware
export interface AgeVerificationData {
  dateOfBirth: string;
  parentalConsent?: boolean;
  parentEmail?: string;
  parentName?: string;
  verificationMethod: 'id_document' | 'parental_consent' | 'credit_card';
}

// Age verification schema
const ageVerificationSchema = z.object({
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  parentalConsent: z.boolean().optional(),
  parentEmail: z.string().email().optional(),
  parentName: z.string().min(2).optional(),
  verificationMethod: z.enum(['id_document', 'parental_consent', 'credit_card']),
});

// Calculate age from date of birth
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Age verification middleware
export const verifyAge = (req: Request, res: Response, next: NextFunction) => {
  try {
    const verificationData = ageVerificationSchema.parse(req.body);
    const age = calculateAge(verificationData.dateOfBirth);
    
    // COPPA Compliance: No users under 13
    if (age < 13) {
      return res.status(403).json({
        error: 'COPPA_VIOLATION',
        message: 'Users under 13 are not permitted to use this platform.',
        details: 'This restriction is required by the Children\'s Online Privacy Protection Act (COPPA).'
      });
    }
    
    // Minors (13-17) require parental consent
    if (age < 18) {
      if (!verificationData.parentalConsent) {
        return res.status(400).json({
          error: 'PARENTAL_CONSENT_REQUIRED',
          message: 'Users under 18 require parental consent to use this platform.',
          requirements: {
            parentalConsent: true,
            parentEmail: 'Required for verification',
            parentName: 'Required for legal compliance'
          }
        });
      }
      
      if (!verificationData.parentEmail || !verificationData.parentName) {
        return res.status(400).json({
          error: 'INCOMPLETE_PARENTAL_INFO',
          message: 'Parent email and name are required for users under 18.',
        });
      }
      
      // Add minor flag to request for special handling
      (req as any).isMinor = true;
      (req as any).parentInfo = {
        email: verificationData.parentEmail,
        name: verificationData.parentName,
        consentGiven: verificationData.parentalConsent
      };
    }
    
    // Adult users (18+) - standard verification
    if (age >= 18) {
      (req as any).isAdult = true;
    }
    
    // Store age and verification info in request
    (req as any).userAge = age;
    (req as any).ageVerification = verificationData;
    
    // Log age verification for compliance
    console.log(`Age verification completed: Age ${age}, Method: ${verificationData.verificationMethod}`);
    
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'INVALID_AGE_VERIFICATION',
        message: 'Invalid age verification data provided.',
        details: error.errors
      });
    }
    
    console.error('Age verification error:', error);
    res.status(500).json({
      error: 'AGE_VERIFICATION_FAILED',
      message: 'Unable to verify age. Please try again.'
    });
  }
};

// Parental consent verification
export const verifyParentalConsent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { parentEmail, verificationCode } = req.body;
    
    if (!parentEmail || !verificationCode) {
      return res.status(400).json({
        error: 'MISSING_CONSENT_DATA',
        message: 'Parent email and verification code are required.'
      });
    }
    
    // In production, verify the code was sent to parent's email
    // This is a simplified version - implement proper email verification
    const isValidCode = await verifyParentalConsentCode(parentEmail, verificationCode);
    
    if (!isValidCode) {
      return res.status(401).json({
        error: 'INVALID_CONSENT_CODE',
        message: 'Invalid parental consent verification code.'
      });
    }
    
    (req as any).parentalConsentVerified = true;
    next();
  } catch (error) {
    console.error('Parental consent verification error:', error);
    res.status(500).json({
      error: 'CONSENT_VERIFICATION_FAILED',
      message: 'Unable to verify parental consent.'
    });
  }
};

// Mock function - replace with actual email verification system
async function verifyParentalConsentCode(parentEmail: string, code: string): Promise<boolean> {
  // In production, this would:
  // 1. Check if code was sent to this email
  // 2. Verify code hasn't expired (typically 24-48 hours)
  // 3. Ensure code hasn't been used already
  // 4. Log the verification for legal compliance
  
  // For demo purposes, accept any 6-digit code
  return /^\d{6}$/.test(code);
}

// Generate parental consent email
export const sendParentalConsentEmail = async (parentEmail: string, childName: string): Promise<boolean> => {
  try {
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In production, send actual email with verification code
    console.log(`Parental consent email sent to ${parentEmail} for child ${childName}. Code: ${verificationCode}`);
    
    // Store code for verification (use Redis or database in production)
    // consentCodes.set(parentEmail, { code: verificationCode, expires: Date.now() + 24*60*60*1000 });
    
    return true;
  } catch (error) {
    console.error('Failed to send parental consent email:', error);
    return false;
  }
};

// Additional COPPA compliance checks
export const coppaComplianceCheck = (req: Request, res: Response, next: NextFunction) => {
  const userAge = (req as any).userAge;
  const isMinor = (req as any).isMinor;
  
  // Enhanced restrictions for users under 18
  if (isMinor) {
    // Limit data collection for minors
    (req as any).dataCollectionLimited = true;
    
    // Require additional safety measures
    (req as any).enhancedSafety = true;
    
    // No behavioral advertising
    (req as any).noBehavioralAds = true;
    
    // Limited communication features
    (req as any).limitedCommunication = true;
  }
  
  next();
};

// Export all middleware functions
export default {
  verifyAge,
  verifyParentalConsent,
  sendParentalConsentEmail,
  coppaComplianceCheck,
};