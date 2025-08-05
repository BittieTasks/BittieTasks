import { storage } from "../storage";

export interface EthicalPartnershipCriteria {
  hrcScore: number; // Human Rights Campaign Corporate Equality Index (0-100)
  deiLeadership: boolean; // Has documented diversity, equity, inclusion programs
  lgbtqSupport: boolean; // Supports LGBTQ+ rights and workplace equality
  environmentalScore: number; // Environmental responsibility score (0-100)
  laborPracticesScore: number; // Fair labor practices score (0-100)
  communityInvestment: boolean; // Invests in underrepresented communities
  controversyScore: number; // Lower is better (0-100, where 0 = no controversies)
  carbonNeutralCommitment: boolean; // Has carbon neutral/negative commitment
  supplierDiversityProgram: boolean; // Has supplier diversity programs
}

export interface PartnershipCandidate {
  companyName: string;
  industry: string;
  proposedTaskType: string;
  proposedPayment: number;
  ethicalCriteria: EthicalPartnershipCriteria;
  taskDescription: string;
  targetAudience: string;
  expectedParticipants: number;
}

export class EthicalPartnershipMatcher {
  private minimumRequirements: EthicalPartnershipCriteria = {
    hrcScore: 80, // Minimum 80/100 on HRC index
    deiLeadership: true,
    lgbtqSupport: true,
    environmentalScore: 60, // Minimum environmental responsibility
    laborPracticesScore: 70, // Fair labor practices required
    communityInvestment: true,
    controversyScore: 30, // Maximum controversy threshold
    carbonNeutralCommitment: false, // Nice to have but not required
    supplierDiversityProgram: false // Nice to have but not required
  };

  /**
   * Evaluates a potential corporate partner against ethical criteria
   */
  evaluatePartner(candidate: PartnershipCandidate): {
    approved: boolean;
    score: number;
    strengths: string[];
    concerns: string[];
    recommendation: string;
  } {
    const criteria = candidate.ethicalCriteria;
    const strengths: string[] = [];
    const concerns: string[] = [];
    let score = 0;
    let approved = true;

    // Core Requirements (Must Pass All)
    if (criteria.hrcScore < this.minimumRequirements.hrcScore) {
      approved = false;
      concerns.push(`HRC score ${criteria.hrcScore} below minimum ${this.minimumRequirements.hrcScore}`);
    } else {
      strengths.push(`Strong HRC score: ${criteria.hrcScore}/100`);
      score += criteria.hrcScore * 0.3; // 30% weight
    }

    if (!criteria.deiLeadership) {
      approved = false;
      concerns.push("No documented DEI leadership programs");
    } else {
      strengths.push("Has documented DEI leadership");
      score += 20;
    }

    if (!criteria.lgbtqSupport) {
      approved = false;
      concerns.push("Does not support LGBTQ+ workplace equality");
    } else {
      strengths.push("Supports LGBTQ+ workplace equality");
      score += 20;
    }

    if (criteria.controversyScore > this.minimumRequirements.controversyScore) {
      approved = false;
      concerns.push(`High controversy score: ${criteria.controversyScore}`);
    } else {
      strengths.push("Low controversy profile");
      score += (30 - criteria.controversyScore);
    }

    // Additional Scoring Factors
    if (criteria.environmentalScore >= this.minimumRequirements.environmentalScore) {
      strengths.push(`Good environmental practices: ${criteria.environmentalScore}/100`);
      score += criteria.environmentalScore * 0.15; // 15% weight
    } else {
      concerns.push(`Environmental score ${criteria.environmentalScore} below preferred ${this.minimumRequirements.environmentalScore}`);
    }

    if (criteria.laborPracticesScore >= this.minimumRequirements.laborPracticesScore) {
      strengths.push(`Fair labor practices: ${criteria.laborPracticesScore}/100`);
      score += criteria.laborPracticesScore * 0.15; // 15% weight
    } else {
      concerns.push(`Labor practices score ${criteria.laborPracticesScore} below minimum ${this.minimumRequirements.laborPracticesScore}`);
      approved = false;
    }

    if (criteria.communityInvestment) {
      strengths.push("Invests in underrepresented communities");
      score += 10;
    } else {
      concerns.push("No documented community investment programs");
    }

    // Bonus Points
    if (criteria.carbonNeutralCommitment) {
      strengths.push("Has carbon neutral commitment");
      score += 5;
    }

    if (criteria.supplierDiversityProgram) {
      strengths.push("Has supplier diversity programs");
      score += 5;
    }

    // Generate recommendation
    let recommendation = "";
    if (approved && score >= 85) {
      recommendation = "Highly recommended partnership - excellent ethical alignment";
    } else if (approved && score >= 70) {
      recommendation = "Good partnership candidate - meets ethical standards";
    } else if (approved && score >= 60) {
      recommendation = "Acceptable partnership - minimum ethical requirements met";
    } else {
      recommendation = "Partnership not recommended - fails ethical criteria";
      approved = false;
    }

    return {
      approved,
      score: Math.round(score),
      strengths,
      concerns,
      recommendation
    };
  }

  /**
   * Gets a list of pre-approved ethical partners
   */
  getApprovedPartners(): PartnershipCandidate[] {
    return [
      {
        companyName: "Target",
        industry: "Retail",
        proposedTaskType: "Community Shopping Experience",
        proposedPayment: 35,
        taskDescription: "Family shopping groups with exclusive deals",
        targetAudience: "Families with children",
        expectedParticipants: 50,
        ethicalCriteria: {
          hrcScore: 100,
          deiLeadership: true,
          lgbtqSupport: true,
          environmentalScore: 75,
          laborPracticesScore: 80,
          communityInvestment: true,
          controversyScore: 15,
          carbonNeutralCommitment: true,
          supplierDiversityProgram: true
        }
      },
      {
        companyName: "Nike",
        industry: "Athletic Apparel",
        proposedTaskType: "Family Fitness Challenge",
        proposedPayment: 43,
        taskDescription: "Family workout sessions with product testing",
        targetAudience: "Active families",
        expectedParticipants: 30,
        ethicalCriteria: {
          hrcScore: 90,
          deiLeadership: true,
          lgbtqSupport: true,
          environmentalScore: 70,
          laborPracticesScore: 75,
          communityInvestment: true,
          controversyScore: 20,
          carbonNeutralCommitment: true,
          supplierDiversityProgram: true
        }
      },
      {
        companyName: "Apple",
        industry: "Technology",
        proposedTaskType: "Family Tech Workshop",
        proposedPayment: 60,
        taskDescription: "Family technology education and testing",
        targetAudience: "Tech-interested families",
        expectedParticipants: 25,
        ethicalCriteria: {
          hrcScore: 100,
          deiLeadership: true,
          lgbtqSupport: true,
          environmentalScore: 90,
          laborPracticesScore: 85,
          communityInvestment: true,
          controversyScore: 10,
          carbonNeutralCommitment: true,
          supplierDiversityProgram: true
        }
      }
    ];
  }

  /**
   * Finds the best ethical partners for a specific task type
   */
  findPartnersForTaskType(taskType: string, minPayment: number = 0): PartnershipCandidate[] {
    const allPartners = this.getApprovedPartners();
    
    return allPartners
      .filter(partner => {
        const evaluation = this.evaluatePartner(partner);
        return evaluation.approved && 
               partner.proposedPayment >= minPayment &&
               (taskType === 'any' || partner.proposedTaskType.toLowerCase().includes(taskType.toLowerCase()));
      })
      .sort((a, b) => {
        // Sort by ethical score first, then by payment
        const scoreA = this.evaluatePartner(a).score;
        const scoreB = this.evaluatePartner(b).score;
        if (scoreA !== scoreB) return scoreB - scoreA;
        return b.proposedPayment - a.proposedPayment;
      });
  }

  /**
   * Generates a comprehensive partnership report
   */
  generatePartnershipReport(candidate: PartnershipCandidate): string {
    const evaluation = this.evaluatePartner(candidate);
    
    let report = `\n=== ETHICAL PARTNERSHIP EVALUATION ===\n`;
    report += `Company: ${candidate.companyName}\n`;
    report += `Industry: ${candidate.industry}\n`;
    report += `Proposed Task: ${candidate.proposedTaskType}\n`;
    report += `Payment: $${candidate.proposedPayment} per participant\n\n`;
    
    report += `ETHICAL SCORE: ${evaluation.score}/100\n`;
    report += `STATUS: ${evaluation.approved ? 'APPROVED' : 'REJECTED'}\n\n`;
    
    report += `RECOMMENDATION: ${evaluation.recommendation}\n\n`;
    
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
}

export const ethicalPartnershipMatcher = new EthicalPartnershipMatcher();