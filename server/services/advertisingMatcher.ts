import { storage } from "../storage";

export interface AdvertisingCriteria {
  hrcScore: number; // Human Rights Campaign Corporate Equality Index (0-100)
  deiCommitment: boolean; // Has documented diversity, equity, inclusion programs
  lgbtqSupport: boolean; // Supports LGBTQ+ rights and workplace equality
  environmentalScore: number; // Environmental responsibility score (0-100)
  childSafetyCompliance: boolean; // COPPA and child safety compliance
  dataPrivacyScore: number; // Data privacy and protection score (0-100)
  controversyScore: number; // Lower is better (0-100, where 0 = no controversies)
  familyFriendlyContent: boolean; // Content appropriate for families
  transparentAdvertising: boolean; // Clear disclosure of sponsored content
}

export interface AdvertisingCandidate {
  companyName: string;
  industry: string;
  adType: 'native_feed' | 'banner' | 'sponsored_task' | 'affiliate_product';
  proposedBudget: number; // Monthly advertising budget
  targetAudience: string;
  contentDescription: string;
  ethicalCriteria: AdvertisingCriteria;
  proposedCommissionRate?: number; // For affiliate marketing (0-20%)
  adContent?: {
    title: string;
    description: string;
    imageUrl?: string;
    ctaText: string;
    landingUrl: string;
  };
}

export interface AdvertisingEvaluation {
  approved: boolean;
  score: number;
  tier: 'premium' | 'standard' | 'basic' | 'rejected';
  strengths: string[];
  concerns: string[];
  recommendation: string;
  suggestedCommissionRate?: number;
}

export class AdvertisingMatcher {
  private minimumRequirements: AdvertisingCriteria = {
    hrcScore: 75, // Slightly lower than partnerships for advertising
    deiCommitment: true,
    lgbtqSupport: true,
    environmentalScore: 50,
    childSafetyCompliance: true, // Mandatory for family platform
    dataPrivacyScore: 70, // Important for user trust
    controversyScore: 40, // Higher tolerance for advertising vs partnerships
    familyFriendlyContent: true, // Mandatory
    transparentAdvertising: true // Mandatory
  };

  /**
   * Evaluates a potential advertiser against ethical criteria
   */
  evaluateAdvertiser(candidate: AdvertisingCandidate): AdvertisingEvaluation {
    const criteria = candidate.ethicalCriteria;
    const strengths: string[] = [];
    const concerns: string[] = [];
    let score = 0;
    let approved = true;

    // Mandatory Requirements (Must Pass All)
    if (!criteria.childSafetyCompliance) {
      approved = false;
      concerns.push("Child safety compliance is mandatory for family platform");
    } else {
      strengths.push("Child safety compliant");
      score += 25;
    }

    if (!criteria.familyFriendlyContent) {
      approved = false;
      concerns.push("Content must be family-friendly");
    } else {
      strengths.push("Family-friendly content");
      score += 20;
    }

    if (!criteria.transparentAdvertising) {
      approved = false;
      concerns.push("Transparent advertising disclosure required");
    } else {
      strengths.push("Transparent advertising practices");
      score += 15;
    }

    // Core Ethical Requirements
    if (criteria.hrcScore < this.minimumRequirements.hrcScore) {
      approved = false;
      concerns.push(`HRC score ${criteria.hrcScore} below minimum ${this.minimumRequirements.hrcScore}`);
    } else {
      strengths.push(`Good HRC score: ${criteria.hrcScore}/100`);
      score += criteria.hrcScore * 0.2; // 20% weight
    }

    if (!criteria.deiCommitment) {
      approved = false;
      concerns.push("DEI commitment required");
    } else {
      strengths.push("Has DEI commitment");
      score += 15;
    }

    if (!criteria.lgbtqSupport) {
      approved = false;
      concerns.push("LGBTQ+ support required");
    } else {
      strengths.push("Supports LGBTQ+ equality");
      score += 15;
    }

    // Additional Scoring Factors
    if (criteria.dataPrivacyScore >= this.minimumRequirements.dataPrivacyScore) {
      strengths.push(`Strong data privacy: ${criteria.dataPrivacyScore}/100`);
      score += criteria.dataPrivacyScore * 0.1; // 10% weight
    } else {
      concerns.push(`Data privacy score ${criteria.dataPrivacyScore} below preferred ${this.minimumRequirements.dataPrivacyScore}`);
    }

    if (criteria.environmentalScore >= this.minimumRequirements.environmentalScore) {
      strengths.push(`Environmental responsibility: ${criteria.environmentalScore}/100`);
      score += criteria.environmentalScore * 0.1; // 10% weight
    }

    if (criteria.controversyScore <= this.minimumRequirements.controversyScore) {
      strengths.push("Low controversy profile");
      score += (40 - criteria.controversyScore) * 0.5;
    } else {
      concerns.push(`High controversy score: ${criteria.controversyScore}`);
      if (criteria.controversyScore > 70) {
        approved = false;
      }
    }

    // Determine tier and commission rate
    let tier: 'premium' | 'standard' | 'basic' | 'rejected' = 'rejected';
    let suggestedCommissionRate = 0;

    if (approved) {
      if (score >= 90) {
        tier = 'premium';
        suggestedCommissionRate = candidate.adType === 'affiliate_product' ? 8 : 0;
      } else if (score >= 75) {
        tier = 'standard';
        suggestedCommissionRate = candidate.adType === 'affiliate_product' ? 6 : 0;
      } else if (score >= 60) {
        tier = 'basic';
        suggestedCommissionRate = candidate.adType === 'affiliate_product' ? 4 : 0;
      } else {
        approved = false;
        tier = 'rejected';
      }
    }

    // Generate recommendation
    let recommendation = "";
    if (tier === 'premium') {
      recommendation = "Excellent advertising partner - premium placement recommended";
    } else if (tier === 'standard') {
      recommendation = "Good advertising partner - standard placement approved";
    } else if (tier === 'basic') {
      recommendation = "Acceptable advertising partner - basic placement only";
    } else {
      recommendation = "Advertising partnership not recommended - fails ethical criteria";
    }

    return {
      approved,
      score: Math.round(score),
      tier,
      strengths,
      concerns,
      recommendation,
      suggestedCommissionRate
    };
  }

  /**
   * Gets approved advertising partners by tier
   */
  getApprovedAdvertisers(tier?: 'premium' | 'standard' | 'basic'): AdvertisingCandidate[] {
    const advertisers: AdvertisingCandidate[] = [
      {
        companyName: "Target",
        industry: "Retail",
        adType: "affiliate_product",
        proposedBudget: 5000,
        targetAudience: "Parents shopping for family essentials",
        contentDescription: "Family-friendly products and household essentials",
        proposedCommissionRate: 6,
        ethicalCriteria: {
          hrcScore: 100,
          deiCommitment: true,
          lgbtqSupport: true,
          environmentalScore: 75,
          childSafetyCompliance: true,
          dataPrivacyScore: 85,
          controversyScore: 15,
          familyFriendlyContent: true,
          transparentAdvertising: true
        },
        adContent: {
          title: "Family Essentials from Target",
          description: "Quality products for your family's daily needs",
          ctaText: "Shop Family Essentials",
          landingUrl: "https://target.com/family"
        }
      },
      {
        companyName: "Honest Company",
        industry: "Consumer Products",
        adType: "native_feed",
        proposedBudget: 3000,
        targetAudience: "Health-conscious parents",
        contentDescription: "Natural, eco-friendly family products",
        ethicalCriteria: {
          hrcScore: 85,
          deiCommitment: true,
          lgbtqSupport: true,
          environmentalScore: 95,
          childSafetyCompliance: true,
          dataPrivacyScore: 80,
          controversyScore: 10,
          familyFriendlyContent: true,
          transparentAdvertising: true
        },
        adContent: {
          title: "Safe & Natural Family Products",
          description: "Plant-based products for your family's health and safety",
          ctaText: "Discover Honest Products",
          landingUrl: "https://honest.com"
        }
      },
      {
        companyName: "Patagonia",
        industry: "Outdoor Apparel",
        adType: "sponsored_task",
        proposedBudget: 4000,
        targetAudience: "Active families who love outdoors",
        contentDescription: "Outdoor family activities and sustainable gear",
        ethicalCriteria: {
          hrcScore: 90,
          deiCommitment: true,
          lgbtqSupport: true,
          environmentalScore: 100,
          childSafetyCompliance: true,
          dataPrivacyScore: 75,
          controversyScore: 5,
          familyFriendlyContent: true,
          transparentAdvertising: true
        },
        adContent: {
          title: "Family Outdoor Adventures",
          description: "Sustainable gear for your family's outdoor adventures",
          ctaText: "Explore Outdoor Gear",
          landingUrl: "https://patagonia.com/family"
        }
      }
    ];

    if (!tier) return advertisers;
    
    return advertisers.filter(advertiser => {
      const evaluation = this.evaluateAdvertiser(advertiser);
      return evaluation.tier === tier;
    });
  }

  /**
   * Finds advertising opportunities for specific content types
   */
  findAdsForContent(contentType: string, audienceType: string = 'general'): AdvertisingCandidate[] {
    const allAdvertisers = this.getApprovedAdvertisers();
    
    return allAdvertisers
      .filter(advertiser => {
        const evaluation = this.evaluateAdvertiser(advertiser);
        return evaluation.approved && 
               (contentType === 'any' || 
                advertiser.contentDescription.toLowerCase().includes(contentType.toLowerCase()) ||
                advertiser.targetAudience.toLowerCase().includes(audienceType.toLowerCase()));
      })
      .sort((a, b) => {
        const scoreA = this.evaluateAdvertiser(a).score;
        const scoreB = this.evaluateAdvertiser(b).score;
        if (scoreA !== scoreB) return scoreB - scoreA;
        return b.proposedBudget - a.proposedBudget;
      });
  }

  /**
   * Generates comprehensive advertising evaluation report
   */
  generateAdvertisingReport(candidate: AdvertisingCandidate): string {
    const evaluation = this.evaluateAdvertiser(candidate);
    
    let report = `\n=== ADVERTISING PARTNERSHIP EVALUATION ===\n`;
    report += `Company: ${candidate.companyName}\n`;
    report += `Industry: ${candidate.industry}\n`;
    report += `Ad Type: ${candidate.adType.replace('_', ' ').toUpperCase()}\n`;
    report += `Monthly Budget: $${candidate.proposedBudget.toLocaleString()}\n\n`;
    
    report += `ETHICAL SCORE: ${evaluation.score}/100\n`;
    report += `TIER: ${evaluation.tier.toUpperCase()}\n`;
    report += `STATUS: ${evaluation.approved ? 'APPROVED' : 'REJECTED'}\n\n`;
    
    report += `RECOMMENDATION: ${evaluation.recommendation}\n\n`;
    
    if (evaluation.suggestedCommissionRate && evaluation.suggestedCommissionRate > 0) {
      report += `SUGGESTED COMMISSION RATE: ${evaluation.suggestedCommissionRate}%\n\n`;
    }
    
    if (evaluation.strengths.length > 0) {
      report += `STRENGTHS:\n`;
      evaluation.strengths.forEach(strength => report += `✓ ${strength}\n`);
      report += `\n`;
    }
    
    if (evaluation.concerns.length > 0) {
      report += `CONCERNS:\n`;
      evaluation.concerns.forEach(concern => report += `⚠ ${concern}\n`);
      report += `\n`;
    }
    
    return report;
  }

  /**
   * Calculates revenue sharing for different ad tiers
   */
  calculateRevenueSplit(tier: 'premium' | 'standard' | 'basic', monthlyBudget: number): {
    platformFee: number;
    userEarnings: number;
    creatorBonus: number;
  } {
    let platformFeePercent = 0;
    let userEarningsPercent = 0;
    let creatorBonusPercent = 0;

    switch (tier) {
      case 'premium':
        platformFeePercent = 20;
        userEarningsPercent = 70;
        creatorBonusPercent = 10;
        break;
      case 'standard':
        platformFeePercent = 25;
        userEarningsPercent = 65;
        creatorBonusPercent = 10;
        break;
      case 'basic':
        platformFeePercent = 30;
        userEarningsPercent = 60;
        creatorBonusPercent = 10;
        break;
    }

    return {
      platformFee: Math.round(monthlyBudget * (platformFeePercent / 100)),
      userEarnings: Math.round(monthlyBudget * (userEarningsPercent / 100)),
      creatorBonus: Math.round(monthlyBudget * (creatorBonusPercent / 100))
    };
  }
}

export const advertisingMatcher = new AdvertisingMatcher();