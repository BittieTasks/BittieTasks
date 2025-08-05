import crypto from 'crypto';
import { storage } from '../storage';
import type { User } from '@shared/schema';

export interface VerificationResult {
  success: boolean;
  score: number;
  level: 'basic' | 'standard' | 'premium';
  details: {
    captcha: boolean;
    phoneVerified: boolean;
    identityDocuments: boolean;
    faceVerification: boolean;
    behaviorAnalysis: boolean;
    deviceFingerprint: boolean;
  };
  requirements: string[];
  riskFlags: string[];
}

export interface BehaviorAnalysis {
  mouseMovementPattern: number; // 0-100 naturalness score
  keystrokeRhythm: number; // 0-100 human-like typing score
  sessionDuration: number; // Minutes spent on platform
  pageNavigationPattern: number; // 0-100 human-like navigation score
  timeSpentOnForms: number; // Seconds spent filling forms
  scrollBehavior: number; // 0-100 natural scrolling score
}

export class HumanVerificationService {
  private readonly MINIMUM_HUMAN_SCORE = 75;
  private readonly PREMIUM_HUMAN_SCORE = 95;
  private readonly CAPTCHA_THRESHOLD = 0.7;

  /**
   * Comprehensive human verification check
   */
  async verifyHuman(userId: string, verificationData: any): Promise<VerificationResult> {
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const result: VerificationResult = {
      success: false,
      score: 0,
      level: 'basic',
      details: {
        captcha: false,
        phoneVerified: false,
        identityDocuments: false,
        faceVerification: false,
        behaviorAnalysis: false,
        deviceFingerprint: false
      },
      requirements: [],
      riskFlags: []
    };

    // 1. CAPTCHA Verification (20 points)
    const captchaScore = await this.verifyCaptcha(user, verificationData.captchaToken);
    result.details.captcha = captchaScore >= this.CAPTCHA_THRESHOLD;
    result.score += result.details.captcha ? 20 : 0;

    // 2. Phone Verification (15 points)
    result.details.phoneVerified = user.isPhoneVerified || false;
    result.score += result.details.phoneVerified ? 15 : 0;

    // 3. Identity Documents (25 points)
    result.details.identityDocuments = user.governmentIdVerified || false;
    result.score += result.details.identityDocuments ? 25 : 0;

    // 4. Face Verification (20 points)
    result.details.faceVerification = user.faceVerificationCompleted && user.livelinessCheckPassed || false;
    result.score += result.details.faceVerification ? 20 : 0;

    // 5. Behavior Analysis (15 points)
    const behaviorScore = await this.analyzeBehavior(user, verificationData.behaviorData);
    result.details.behaviorAnalysis = behaviorScore >= 70;
    result.score += result.details.behaviorAnalysis ? 15 : 0;

    // 6. Device Fingerprinting (5 points)
    result.details.deviceFingerprint = await this.verifyDeviceFingerprint(user, verificationData.deviceData);
    result.score += result.details.deviceFingerprint ? 5 : 0;

    // Risk Assessment
    result.riskFlags = await this.assessRiskFactors(user, verificationData);

    // Determine verification level and success
    if (result.score >= this.PREMIUM_HUMAN_SCORE && result.riskFlags.length === 0) {
      result.level = 'premium';
      result.success = true;
    } else if (result.score >= this.MINIMUM_HUMAN_SCORE && result.riskFlags.length <= 1) {
      result.level = 'standard';
      result.success = true;
    } else if (result.score >= 60 && result.riskFlags.length <= 2) {
      result.level = 'basic';
      result.success = true;
    }

    // Add requirements for improvement
    result.requirements = this.generateRequirements(result);

    // Update user verification status
    await this.updateUserVerificationStatus(userId, result);

    return result;
  }

  /**
   * Verify CAPTCHA response
   */
  private async verifyCaptcha(user: User, captchaToken?: string): Promise<number> {
    if (!captchaToken) return 0;

    // In production, this would verify with Google reCAPTCHA
    // For now, simulate verification based on token format
    if (captchaToken.startsWith('demo_captcha_')) {
      const score = parseFloat(captchaToken.replace('demo_captcha_', '')) || 0;
      return Math.min(1.0, Math.max(0.0, score));
    }

    // Mock verification - in production integrate with reCAPTCHA API
    return 0.85; // Assume high human score for demo
  }

  /**
   * Analyze user behavior patterns for bot detection
   */
  private async analyzeBehavior(user: User, behaviorData?: BehaviorAnalysis): Promise<number> {
    if (!behaviorData) return 0;

    let score = 0;
    const weights = {
      mouseMovement: 0.25,
      keystroke: 0.25,
      sessionDuration: 0.15,
      navigation: 0.15,
      formTime: 0.10,
      scrollBehavior: 0.10
    };

    // Analyze mouse movement naturalness
    if (behaviorData.mouseMovementPattern >= 70) score += weights.mouseMovement * 100;
    else if (behaviorData.mouseMovementPattern >= 50) score += weights.mouseMovement * 60;

    // Analyze keystroke patterns
    if (behaviorData.keystrokeRhythm >= 70) score += weights.keystroke * 100;
    else if (behaviorData.keystrokeRhythm >= 50) score += weights.keystroke * 60;

    // Session duration (humans spend reasonable time)
    if (behaviorData.sessionDuration >= 2 && behaviorData.sessionDuration <= 60) {
      score += weights.sessionDuration * 100;
    }

    // Navigation patterns
    if (behaviorData.pageNavigationPattern >= 70) score += weights.navigation * 100;

    // Form filling time (humans take time to read and think)
    if (behaviorData.timeSpentOnForms >= 30) score += weights.formTime * 100;

    // Scroll behavior
    if (behaviorData.scrollBehavior >= 70) score += weights.scrollBehavior * 100;

    return Math.min(100, score);
  }

  /**
   * Verify device fingerprint for consistency
   */
  private async verifyDeviceFingerprint(user: User, deviceData?: any): Promise<boolean> {
    if (!deviceData) return false;

    // Check if device fingerprint matches previous sessions
    const currentFingerprint = this.generateDeviceFingerprint(deviceData);
    
    if (!user.deviceFingerprint) {
      // First time - accept and store
      return true;
    }

    // Compare with stored fingerprint (allow some variation for legitimate changes)
    const similarity = this.calculateFingerprintSimilarity(user.deviceFingerprint, currentFingerprint);
    return similarity >= 0.8; // 80% similarity threshold
  }

  /**
   * Generate device fingerprint from browser/device data
   */
  private generateDeviceFingerprint(deviceData: any): string {
    const components = [
      deviceData.userAgent,
      deviceData.screenResolution,
      deviceData.timezone,
      deviceData.language,
      deviceData.platform,
      deviceData.canvasFingerprint
    ].filter(Boolean);

    return crypto
      .createHash('sha256')
      .update(components.join('|'))
      .digest('hex');
  }

  /**
   * Calculate similarity between two device fingerprints
   */
  private calculateFingerprintSimilarity(fp1: string, fp2: string): number {
    if (fp1 === fp2) return 1.0;
    
    // Simple similarity calculation - in production use more sophisticated methods
    const common = fp1.split('').filter((char, index) => char === fp2[index]).length;
    return common / Math.max(fp1.length, fp2.length);
  }

  /**
   * Assess risk factors that may indicate bot or fraudulent activity
   */
  private async assessRiskFactors(user: User, verificationData: any): Promise<string[]> {
    const riskFlags: string[] = [];

    // Check for suspicious patterns
    if (user.failedLoginAttempts && user.failedLoginAttempts > 5) {
      riskFlags.push('Multiple failed login attempts');
    }

    // Check account age vs activity
    const accountAge = user.createdAt ? Date.now() - new Date(user.createdAt).getTime() : 0;
    const daysSinceCreation = accountAge / (1000 * 60 * 60 * 24);
    
    if (daysSinceCreation < 1 && user.completedTasks && user.completedTasks > 10) {
      riskFlags.push('Unusually high activity for new account');
    }

    // Check for VPN/Proxy usage (simplified check)
    if (verificationData.ipData && verificationData.ipData.isVpn) {
      riskFlags.push('VPN or proxy detected');
    }

    // Check for suspicious behavior patterns
    if (verificationData.behaviorData) {
      const behavior = verificationData.behaviorData;
      if (behavior.mouseMovementPattern < 30 || behavior.keystrokeRhythm < 30) {
        riskFlags.push('Non-human interaction patterns detected');
      }
    }

    return riskFlags;
  }

  /**
   * Generate requirements for improving verification score
   */
  private generateRequirements(result: VerificationResult): string[] {
    const requirements: string[] = [];

    if (!result.details.captcha) {
      requirements.push('Complete CAPTCHA verification');
    }
    
    if (!result.details.phoneVerified) {
      requirements.push('Verify phone number with SMS code');
    }
    
    if (!result.details.identityDocuments) {
      requirements.push('Upload and verify government-issued ID');
    }
    
    if (!result.details.faceVerification) {
      requirements.push('Complete face verification and liveness check');
    }
    
    if (!result.details.behaviorAnalysis) {
      requirements.push('Complete additional behavior verification tasks');
    }

    return requirements;
  }

  /**
   * Update user verification status in storage
   */
  private async updateUserVerificationStatus(userId: string, result: VerificationResult): Promise<void> {
    const updates: Partial<User> = {
      identityScore: result.score,
      humanVerificationLevel: result.level,
      lastCaptchaVerification: new Date(),
      behaviorScore: result.details.behaviorAnalysis ? 85 : 0,
      sessionBehaviorScore: result.score
    };

    await storage.updateUser(userId, updates);
  }

  /**
   * Check if user meets minimum verification requirements for platform access
   */
  async checkMinimumVerification(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const user = await storage.getUser(userId);
    if (!user) {
      return { allowed: false, reason: 'User not found' };
    }

    // Minimum requirements for platform access
    const minimumScore = user.identityScore || 0;
    const hasEmail = user.isEmailVerified;
    const hasPhone = user.isPhoneVerified;
    const noCriticalRiskFlags = !user.accountLocked;

    if (!hasEmail) {
      return { allowed: false, reason: 'Email verification required' };
    }

    if (minimumScore < 60) {
      return { allowed: false, reason: 'Insufficient human verification score' };
    }

    if (!noCriticalRiskFlags) {
      return { allowed: false, reason: 'Account flagged for security review' };
    }

    return { allowed: true };
  }

  /**
   * Periodic re-verification for existing users
   */
  async scheduleReVerification(userId: string): Promise<void> {
    const user = await storage.getUser(userId);
    if (!user) return;

    // Re-verify users periodically based on risk factors
    const daysSinceLastVerification = user.lastCaptchaVerification 
      ? (Date.now() - new Date(user.lastCaptchaVerification).getTime()) / (1000 * 60 * 60 * 24)
      : 999;

    if (daysSinceLastVerification > 30 || (user.identityScore || 0) < 80) {
      // Mark for re-verification
      await storage.updateUser(userId, {
        humanVerificationLevel: 'basic', // Downgrade until re-verified
        lastCaptchaVerification: null
      });
    }
  }
}

export const humanVerificationService = new HumanVerificationService();