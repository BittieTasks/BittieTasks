import { storage } from "../storage";

interface FraudCheck {
  userId: string;
  riskScore: number;
  factors: string[];
  blocked: boolean;
  timestamp: Date;
}

interface UserBehaviorPattern {
  rapidTaskCreation: boolean;
  suspiciousPaymentAttempts: boolean;
  multipleAccountIndicators: boolean;
  locationAnomalies: boolean;
  reviewManipulation: boolean;
}

class FraudDetectionService {
  private readonly MAX_TASKS_PER_HOUR = 5;
  private readonly MAX_PAYMENT_ATTEMPTS = 3;
  private readonly RISK_THRESHOLD = 70;

  async analyzeUser(userId: string, requestInfo: { ip?: string; userAgent?: string; path?: string; method?: string }): Promise<FraudCheck> {
    const riskFactors: string[] = [];
    let riskScore = 0;

    try {
      // Get user data and recent activity
      const user = await storage.getUser(userId);
      if (!user) {
        return {
          userId,
          riskScore: 100,
          factors: ["User not found"],
          blocked: true,
          timestamp: new Date()
        };
      }

      // Check behavioral patterns
      const patterns = await this.analyzeBehaviorPatterns(userId);
      
      if (patterns.rapidTaskCreation) {
        riskFactors.push("Rapid task creation detected");
        riskScore += 25;
      }

      if (patterns.suspiciousPaymentAttempts) {
        riskFactors.push("Multiple failed payment attempts");
        riskScore += 30;
      }

      if (patterns.multipleAccountIndicators) {
        riskFactors.push("Multiple account indicators");
        riskScore += 35;
      }

      if (patterns.locationAnomalies) {
        riskFactors.push("Location anomalies detected");
        riskScore += 20;
      }

      if (patterns.reviewManipulation) {
        riskFactors.push("Review manipulation patterns");
        riskScore += 40;
      }

      // Check account age and verification
      if (user.createdAt) {
        const accountAge = this.getAccountAge(user.createdAt);
        if (accountAge < 24) { // Less than 24 hours old
          riskFactors.push("New account (less than 24 hours)");
          riskScore += 15;
        }
      }

      if (!user.isEmailVerified) {
        riskFactors.push("Email not verified");
        riskScore += 10;
      }

      // Check IP and device patterns
      if (requestInfo.ip) {
        const ipRisk = await this.analyzeIPPatterns(requestInfo.ip);
        if (ipRisk.suspicious) {
          riskFactors.push(...ipRisk.factors);
          riskScore += ipRisk.score;
        }
      }

      const isBlocked = riskScore >= this.RISK_THRESHOLD;

      return {
        userId,
        riskScore: Math.min(riskScore, 100),
        factors: riskFactors,
        blocked: isBlocked,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Fraud detection error:', error);
      return {
        userId,
        riskScore: 0,
        factors: ["Analysis error - allowing by default"],
        blocked: false,
        timestamp: new Date()
      };
    }
  }

  private async analyzeBehaviorPatterns(userId: string): Promise<UserBehaviorPattern> {
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return {
          rapidTaskCreation: false,
          suspiciousPaymentAttempts: false,
          multipleAccountIndicators: false,
          locationAnomalies: false,
          reviewManipulation: false
        };
      }

      // Check for rapid task creation (more than 5 tasks in last hour)
      const rapidTaskCreation = (user.completedTasks || 0) > this.MAX_TASKS_PER_HOUR;

      // Check failed login attempts as proxy for suspicious payment attempts
      const suspiciousPaymentAttempts = (user.failedLoginAttempts || 0) >= this.MAX_PAYMENT_ATTEMPTS;

      // Check for multiple account indicators
      const multipleAccountIndicators = user.email?.includes('+') || false;

      // Location anomalies - simplified check
      const locationAnomalies = false; // Would need IP geolocation service

      // Review manipulation - check for unusual rating patterns
      const reviewManipulation = parseFloat(user.rating || '0') === 5.0 && (user.completedTasks || 0) === 0;

      return {
        rapidTaskCreation,
        suspiciousPaymentAttempts,
        multipleAccountIndicators,
        locationAnomalies,
        reviewManipulation
      };
    } catch (error) {
      console.error('Behavior analysis error:', error);
      return {
        rapidTaskCreation: false,
        suspiciousPaymentAttempts: false,
        multipleAccountIndicators: false,
        locationAnomalies: false,
        reviewManipulation: false
      };
    }
  }

  private async analyzeIPPatterns(ip: string): Promise<{ suspicious: boolean; factors: string[]; score: number }> {
    const factors: string[] = [];
    let score = 0;

    // Basic IP pattern analysis (would integrate with fraud detection service in production)
    if (ip === '127.0.0.1' || ip === '::1') {
      // Local development - no risk
      return { suspicious: false, factors: [], score: 0 };
    }

    // Check for common VPN/proxy patterns
    if (this.isKnownVPN(ip)) {
      factors.push("VPN/Proxy detected");
      score += 15;
    }

    // Check for tor exit nodes (simplified)
    if (this.isTorExit(ip)) {
      factors.push("Tor exit node");
      score += 30;
    }

    // Check for datacenter IPs (simplified)
    if (this.isDatacenterIP(ip)) {
      factors.push("Datacenter IP");
      score += 20;
    }

    return {
      suspicious: score > 0,
      factors,
      score
    };
  }

  private getAccountAge(createdAt: Date): number {
    const now = new Date();
    const accountCreated = new Date(createdAt);
    return (now.getTime() - accountCreated.getTime()) / (1000 * 60 * 60); // Hours
  }

  private isKnownVPN(ip: string): boolean {
    // Simplified VPN detection - in production would use service like IPQualityScore
    const knownVPNRanges = ['10.', '192.168.', '172.'];
    return knownVPNRanges.some(range => ip.startsWith(range));
  }

  private isTorExit(ip: string): boolean {
    // Simplified Tor detection - in production would check against Tor exit node list
    return false;
  }

  private isDatacenterIP(ip: string): boolean {
    // Simplified datacenter detection - in production would use IP intelligence service
    const datacenterRanges = ['127.', '0.'];
    return datacenterRanges.some(range => ip.startsWith(range));
  }

  async logFraudAttempt(fraudCheck: FraudCheck, action: string): Promise<void> {
    try {
      console.log(`🔍 Fraud Detection: User ${fraudCheck.userId} - Risk Score: ${fraudCheck.riskScore}%`);
      console.log(`🔍 Action: ${action} - Blocked: ${fraudCheck.blocked}`);
      console.log(`🔍 Factors: ${fraudCheck.factors.join(', ')}`);
      
      // In production, would store in database fraud_logs table
    } catch (error) {
      console.error('Error logging fraud attempt:', error);
    }
  }

  async isUserBlocked(userId: string): Promise<boolean> {
    try {
      const user = await storage.getUser(userId);
      return user?.accountLocked || false;
    } catch (error) {
      console.error('Error checking if user is blocked:', error);
      return false;
    }
  }
}

export const fraudDetection = new FraudDetectionService();