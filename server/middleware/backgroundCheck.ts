import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Background check data interface
export interface BackgroundCheckData {
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  socialSecurityNumber: string;
  driverLicenseNumber?: string;
  driverLicenseState?: string;
  addressHistory: AddressHistory[];
  consent: boolean;
  checkTypes: BackgroundCheckType[];
}

interface AddressHistory {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  startDate: string;
  endDate?: string;
}

type BackgroundCheckType = 
  | 'criminal_history' 
  | 'sex_offender_registry' 
  | 'child_abuse_registry' 
  | 'motor_vehicle_records' 
  | 'employment_verification'
  | 'education_verification';

// Background check result interface
export interface BackgroundCheckResult {
  userId: string;
  checkId: string;
  status: 'pending' | 'completed' | 'failed' | 'expired';
  overallResult: 'clear' | 'flag' | 'disqualified';
  completedDate?: Date;
  expirationDate: Date;
  results: {
    criminalHistory: CheckResult;
    sexOffenderRegistry: CheckResult;
    childAbuseRegistry: CheckResult;
    motorVehicleRecords?: CheckResult;
    employmentVerification?: CheckResult;
  };
  flags: BackgroundFlag[];
  notes?: string;
}

interface CheckResult {
  status: 'clear' | 'flag' | 'disqualified';
  details?: string;
  recordsFound?: any[];
}

interface BackgroundFlag {
  type: 'criminal' | 'traffic' | 'employment' | 'other';
  severity: 'low' | 'medium' | 'high' | 'disqualifying';
  description: string;
  date?: string;
  jurisdiction?: string;
  reviewRequired: boolean;
}

// Mock background check results storage
const backgroundCheckResults = new Map<string, BackgroundCheckResult>();

// Background check validation schema
const backgroundCheckSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  socialSecurityNumber: z.string().regex(/^\d{3}-\d{2}-\d{4}$/, 'Invalid SSN format'),
  driverLicenseNumber: z.string().optional(),
  driverLicenseState: z.string().length(2).optional(),
  addressHistory: z.array(z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().length(2),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  })).min(1, 'At least one address is required'),
  consent: z.boolean().refine(val => val === true, 'Consent is required'),
  checkTypes: z.array(z.enum([
    'criminal_history',
    'sex_offender_registry', 
    'child_abuse_registry',
    'motor_vehicle_records',
    'employment_verification',
    'education_verification'
  ])).min(3, 'Minimum required checks: criminal history, sex offender registry, child abuse registry'),
});

// Required background checks for childcare tasks
const REQUIRED_CHILDCARE_CHECKS: BackgroundCheckType[] = [
  'criminal_history',
  'sex_offender_registry',
  'child_abuse_registry'
];

// Disqualifying offenses
const DISQUALIFYING_OFFENSES = [
  'child_abuse',
  'child_neglect',
  'sexual_assault',
  'domestic_violence',
  'drug_trafficking',
  'violent_felony',
  'sex_offense',
  'kidnapping',
  'homicide'
];

// Initialize background check
export const initializeBackgroundCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const checkData = backgroundCheckSchema.parse(req.body);
    
    // Verify all required checks are included
    const hasRequiredChecks = REQUIRED_CHILDCARE_CHECKS.every(
      required => checkData.checkTypes.includes(required)
    );
    
    if (!hasRequiredChecks) {
      return res.status(400).json({
        error: 'MISSING_REQUIRED_CHECKS',
        message: 'Criminal history, sex offender registry, and child abuse registry checks are required.',
        required: REQUIRED_CHILDCARE_CHECKS
      });
    }
    
    // Generate unique check ID
    const checkId = generateCheckId();
    
    // Create background check record
    const backgroundCheck: BackgroundCheckResult = {
      userId,
      checkId,
      status: 'pending',
      overallResult: 'clear', // Will be updated based on results
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      results: {
        criminalHistory: { status: 'clear' },
        sexOffenderRegistry: { status: 'clear' },
        childAbuseRegistry: { status: 'clear' },
      },
      flags: []
    };
    
    // Store the check (in production, save to database)
    backgroundCheckResults.set(checkId, backgroundCheck);
    
    // Initiate actual background check with third-party service
    await initiateThirdPartyBackgroundCheck(checkId, checkData);
    
    res.json({
      message: 'Background check initiated successfully',
      checkId,
      estimatedCompletion: '3-5 business days',
      status: 'pending'
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'INVALID_BACKGROUND_CHECK_DATA',
        message: 'Invalid background check information provided',
        details: error.errors
      });
    }
    
    console.error('Background check initialization error:', error);
    res.status(500).json({
      error: 'BACKGROUND_CHECK_FAILED',
      message: 'Unable to initiate background check'
    });
  }
};

// Check background check status
export const checkBackgroundStatus = async (req: Request, res: Response) => {
  try {
    const { checkId } = req.params;
    const userId = (req as any).userId;
    
    const backgroundCheck = backgroundCheckResults.get(checkId);
    
    if (!backgroundCheck) {
      return res.status(404).json({
        error: 'CHECK_NOT_FOUND',
        message: 'Background check not found'
      });
    }
    
    if (backgroundCheck.userId !== userId) {
      return res.status(403).json({
        error: 'UNAUTHORIZED_ACCESS',
        message: 'Access denied to this background check'
      });
    }
    
    res.json({
      checkId: backgroundCheck.checkId,
      status: backgroundCheck.status,
      overallResult: backgroundCheck.overallResult,
      completedDate: backgroundCheck.completedDate,
      expirationDate: backgroundCheck.expirationDate,
      flags: backgroundCheck.flags.map(flag => ({
        type: flag.type,
        severity: flag.severity,
        description: flag.description,
        reviewRequired: flag.reviewRequired
      }))
    });
    
  } catch (error) {
    console.error('Background check status error:', error);
    res.status(500).json({
      error: 'STATUS_CHECK_FAILED',
      message: 'Unable to retrieve background check status'
    });
  }
};

// Verify current background check status
export const verifyBackgroundCheck = (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    
    // Find current valid background check for user
    const userCheck = Array.from(backgroundCheckResults.values())
      .find(check => 
        check.userId === userId && 
        check.status === 'completed' && 
        check.expirationDate > new Date() &&
        check.overallResult === 'clear'
      );
    
    if (!userCheck) {
      return res.status(403).json({
        error: 'BACKGROUND_CHECK_REQUIRED',
        message: 'Valid background check required to perform childcare tasks',
        details: 'Background checks must be completed and clear, and renewed annually'
      });
    }
    
    // Check for any disqualifying flags
    const disqualifyingFlags = userCheck.flags.filter(flag => 
      flag.severity === 'disqualifying' || 
      DISQUALIFYING_OFFENSES.some(offense => 
        flag.description.toLowerCase().includes(offense.replace('_', ' '))
      )
    );
    
    if (disqualifyingFlags.length > 0) {
      return res.status(403).json({
        error: 'DISQUALIFYING_BACKGROUND',
        message: 'Background check contains disqualifying information',
        details: 'Contact support for review process'
      });
    }
    
    // Add background check info to request
    (req as any).backgroundCheck = userCheck;
    
    next();
  } catch (error) {
    console.error('Background check verification error:', error);
    res.status(500).json({
      error: 'VERIFICATION_FAILED',
      message: 'Unable to verify background check status'
    });
  }
};

// Mock third-party background check service
async function initiateThirdPartyBackgroundCheck(checkId: string, checkData: any): Promise<void> {
  // In production, integrate with services like:
  // - Checkr (https://checkr.com/)
  // - Sterling (https://www.sterlingcheck.com/)
  // - HireRight (https://www.hireright.com/)
  // - First Advantage (https://fadv.com/)
  
  console.log(`Initiating background check ${checkId} for ${checkData.firstName} ${checkData.lastName}`);
  
  // Simulate processing time (in production, this would be webhook-driven)
  setTimeout(() => {
    processBackgroundCheckResults(checkId);
  }, 5000); // 5 seconds for demo
}

// Process background check results (would be called by webhook in production)
function processBackgroundCheckResults(checkId: string): void {
  const backgroundCheck = backgroundCheckResults.get(checkId);
  if (!backgroundCheck) return;
  
  // Simulate various results (in production, these come from the service)
  const results = generateMockResults();
  
  backgroundCheck.status = 'completed';
  backgroundCheck.completedDate = new Date();
  backgroundCheck.results = results.checkResults;
  backgroundCheck.flags = results.flags;
  backgroundCheck.overallResult = results.overallResult;
  
  backgroundCheckResults.set(checkId, backgroundCheck);
  
  console.log(`Background check ${checkId} completed with result: ${results.overallResult}`);
  
  // In production, send notification to user
  // notifyUserOfBackgroundCheckCompletion(backgroundCheck);
}

// Generate mock background check results
function generateMockResults() {
  // For demo purposes, generate mostly clear results with occasional flags
  const hasFlag = Math.random() < 0.1; // 10% chance of flag
  
  const checkResults = {
    criminalHistory: { status: 'clear' as const },
    sexOffenderRegistry: { status: 'clear' as const },
    childAbuseRegistry: { status: 'clear' as const },
    motorVehicleRecords: { status: 'clear' as const },
  };
  
  const flags: BackgroundFlag[] = [];
  let overallResult: 'clear' | 'flag' | 'disqualified' = 'clear';
  
  if (hasFlag) {
    // Add a minor traffic violation flag
    flags.push({
      type: 'traffic',
      severity: 'low',
      description: 'Minor traffic violation - speeding ticket',
      date: '2023-03-15',
      jurisdiction: 'State of California',
      reviewRequired: false
    });
    
    checkResults.motorVehicleRecords.status = 'flag' as const;
    overallResult = 'flag';
  }
  
  return { checkResults, flags, overallResult };
}

// Generate unique check ID
function generateCheckId(): string {
  return `BGC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get background check expiration warning
export const checkExpirationWarning = (req: Request, res: Response, next: NextFunction) => {
  const backgroundCheck = (req as any).backgroundCheck;
  
  if (backgroundCheck) {
    const daysUntilExpiration = Math.ceil(
      (backgroundCheck.expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysUntilExpiration <= 30) {
      (req as any).backgroundCheckWarning = {
        daysUntilExpiration,
        message: 'Background check expires soon. Please renew to continue providing childcare services.'
      };
    }
  }
  
  next();
};

export default {
  initializeBackgroundCheck,
  checkBackgroundStatus,
  verifyBackgroundCheck,
  checkExpirationWarning,
};