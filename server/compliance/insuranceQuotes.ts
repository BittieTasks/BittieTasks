// Insurance Requirements and Quote Calculator for TaskParent

export interface InsuranceCoverage {
  type: string;
  coverage: string;
  premium: {
    min: number;
    max: number;
    frequency: 'monthly' | 'annually';
  };
  required: boolean;
  description: string;
  providers: string[];
}

export interface InsuranceQuote {
  totalAnnualCost: {
    minimum: number;
    maximum: number;
  };
  coverages: InsuranceCoverage[];
  recommendations: string[];
  riskFactors: string[];
}

// TaskParent Insurance Requirements
export const REQUIRED_INSURANCE_COVERAGES: InsuranceCoverage[] = [
  {
    type: 'general_liability',
    coverage: '$5-10 million per occurrence',
    premium: { min: 15000, max: 50000, frequency: 'annually' },
    required: true,
    description: 'Covers bodily injury, property damage, and personal injury claims from platform operations',
    providers: ['Hiscox', 'The Hartford', 'Liberty Mutual', 'Travelers', 'CNA']
  },
  {
    type: 'professional_liability',
    coverage: '$2-5 million per claim',
    premium: { min: 10000, max: 25000, frequency: 'annually' },
    required: true,
    description: 'Covers errors, omissions, and negligent acts in platform services and operations',
    providers: ['Beazley', 'AIG', 'Chubb', 'Munich Re', 'Swiss Re']
  },
  {
    type: 'cyber_liability',
    coverage: '$1-5 million per incident',
    premium: { min: 5000, max: 20000, frequency: 'annually' },
    required: true,
    description: 'Covers data breaches, cyber attacks, privacy violations, and business interruption',
    providers: ['AIG', 'Beazley', 'CyberScout', 'Chubb', 'Travelers']
  },
  {
    type: 'directors_officers',
    coverage: '$1-3 million per claim',
    premium: { min: 3000, max: 10000, frequency: 'annually' },
    required: true,
    description: 'Covers management liability, employment practices, and corporate governance claims',
    providers: ['AIG', 'Chubb', 'Travelers', 'The Hartford', 'Liberty Mutual']
  },
  {
    type: 'workers_compensation',
    coverage: 'State-mandated minimums',
    premium: { min: 2000, max: 15000, frequency: 'annually' },
    required: true,
    description: 'Required if platform has employees; covers workplace injuries and illnesses',
    providers: ['State Fund', 'Liberty Mutual', 'Travelers', 'The Hartford', 'Zurich']
  },
  {
    type: 'employment_practices',
    coverage: '$1-2 million per claim',
    premium: { min: 2000, max: 8000, frequency: 'annually' },
    required: true,
    description: 'Covers discrimination, harassment, wrongful termination, and wage disputes',
    providers: ['The Hartford', 'Travelers', 'CNA', 'Liberty Mutual', 'AIG']
  },
  {
    type: 'fiduciary_liability',
    coverage: '$1-3 million per claim',
    premium: { min: 1500, max: 5000, frequency: 'annually' },
    required: false,
    description: 'Covers breach of fiduciary duty related to employee benefit plans',
    providers: ['Chubb', 'AIG', 'Travelers', 'Liberty Mutual', 'The Hartford']
  },
  {
    type: 'kidnap_ransom',
    coverage: '$1-5 million per incident',
    premium: { min: 2000, max: 8000, frequency: 'annually' },
    required: false,
    description: 'Covers extortion, kidnapping, and personal security threats to key personnel',
    providers: ['AIG', 'Chubb', 'Hiscox', 'Beazley', 'Liberty Mutual']
  }
];

// Calculate insurance quote based on business parameters
export function calculateInsuranceQuote(params: {
  annualRevenue: number;
  numberOfEmployees: number;
  numberOfUsers: number;
  operatingStates: string[];
  hasChildcareServices: boolean;
  dataStorageAmount: 'minimal' | 'moderate' | 'extensive';
}): InsuranceQuote {
  
  const baseCoverages = REQUIRED_INSURANCE_COVERAGES.filter(c => c.required);
  const riskMultiplier = calculateRiskMultiplier(params);
  
  // Adjust premiums based on risk factors
  const adjustedCoverages = baseCoverages.map(coverage => ({
    ...coverage,
    premium: {
      ...coverage.premium,
      min: Math.round(coverage.premium.min * riskMultiplier),
      max: Math.round(coverage.premium.max * riskMultiplier)
    }
  }));
  
  const totalMin = adjustedCoverages.reduce((sum, c) => sum + c.premium.min, 0);
  const totalMax = adjustedCoverages.reduce((sum, c) => sum + c.premium.max, 0);
  
  return {
    totalAnnualCost: {
      minimum: totalMin,
      maximum: totalMax
    },
    coverages: adjustedCoverages,
    recommendations: generateRecommendations(params, riskMultiplier),
    riskFactors: identifyRiskFactors(params)
  };
}

// Calculate risk multiplier based on business characteristics
function calculateRiskMultiplier(params: any): number {
  let multiplier = 1.0;
  
  // Revenue-based risk
  if (params.annualRevenue > 10000000) multiplier += 0.3; // $10M+
  else if (params.annualRevenue > 5000000) multiplier += 0.2; // $5M+
  else if (params.annualRevenue > 1000000) multiplier += 0.1; // $1M+
  
  // Employee count risk
  if (params.numberOfEmployees > 50) multiplier += 0.2;
  else if (params.numberOfEmployees > 20) multiplier += 0.1;
  
  // User base risk
  if (params.numberOfUsers > 100000) multiplier += 0.3;
  else if (params.numberOfUsers > 50000) multiplier += 0.2;
  else if (params.numberOfUsers > 10000) multiplier += 0.1;
  
  // Geographic risk
  const highRiskStates = ['CA', 'NY', 'FL', 'TX', 'IL'];
  const operatesInHighRisk = params.operatingStates.some((state: string) => 
    highRiskStates.includes(state)
  );
  if (operatesInHighRisk) multiplier += 0.15;
  
  // Multi-state operations
  if (params.operatingStates.length > 10) multiplier += 0.2;
  else if (params.operatingStates.length > 5) multiplier += 0.1;
  
  // Childcare services (highest risk)
  if (params.hasChildcareServices) multiplier += 0.5;
  
  // Data storage risk
  if (params.dataStorageAmount === 'extensive') multiplier += 0.2;
  else if (params.dataStorageAmount === 'moderate') multiplier += 0.1;
  
  return Math.min(multiplier, 2.5); // Cap at 2.5x base rate
}

// Generate insurance recommendations
function generateRecommendations(params: any, riskMultiplier: number): string[] {
  const recommendations: string[] = [];
  
  if (params.hasChildcareServices) {
    recommendations.push('Consider excess liability coverage ($10-20M) due to childcare exposure');
    recommendations.push('Implement comprehensive background check program to reduce liability');
    recommendations.push('Require additional insured status on provider liability policies');
  }
  
  if (params.numberOfUsers > 50000) {
    recommendations.push('Increase cyber liability coverage to $10M+ due to large user base');
    recommendations.push('Consider stand-alone data breach coverage');
  }
  
  if (params.operatingStates.length > 5) {
    recommendations.push('Review state-specific insurance requirements');
    recommendations.push('Consider admitted vs. non-admitted carrier options');
  }
  
  if (riskMultiplier > 1.5) {
    recommendations.push('Work with specialized insurance broker familiar with platform economy');
    recommendations.push('Consider captive insurance program for long-term cost management');
    recommendations.push('Implement comprehensive risk management program');
  }
  
  recommendations.push('Annual insurance program review recommended');
  recommendations.push('Consider umbrella/excess liability for catastrophic claims');
  
  return recommendations;
}

// Identify risk factors affecting insurance
function identifyRiskFactors(params: any): string[] {
  const factors: string[] = [];
  
  if (params.hasChildcareServices) {
    factors.push('Childcare services increase liability exposure significantly');
  }
  
  if (params.numberOfUsers > 100000) {
    factors.push('Large user base increases cyber and privacy risks');
  }
  
  if (params.operatingStates.includes('CA')) {
    factors.push('California operations subject to strict employment and privacy laws');
  }
  
  if (params.dataStorageAmount === 'extensive') {
    factors.push('Extensive data storage increases cyber liability exposure');
  }
  
  if (params.numberOfEmployees > 50) {
    factors.push('Large employee base increases employment practices liability');
  }
  
  const highRiskStates = ['CA', 'NY', 'FL', 'TX', 'IL'];
  const operatesInHighRisk = params.operatingStates.some((state: string) => 
    highRiskStates.includes(state)
  );
  if (operatesInHighRisk) {
    factors.push('Operations in high-litigation states increase overall risk');
  }
  
  return factors;
}

// Insurance provider contact information
export const INSURANCE_PROVIDER_CONTACTS = {
  brokers: [
    {
      name: 'Marsh McLennan',
      specialty: 'Large platform risks',
      contact: '1-800-MARSH-1',
      website: 'https://www.marsh.com'
    },
    {
      name: 'Aon',
      specialty: 'Technology E&O and cyber',
      contact: '1-800-AON-RISK',
      website: 'https://www.aon.com'
    },
    {
      name: 'Willis Towers Watson',
      specialty: 'Platform economy risks',
      contact: '1-800-WILLIS',
      website: 'https://www.willistowerswatson.com'
    }
  ],
  carriers: [
    {
      name: 'AIG',
      specialty: 'Technology E&O, cyber liability',
      contact: '1-800-AIG-0123',
      website: 'https://www.aig.com'
    },
    {
      name: 'Beazley',
      specialty: 'Tech E&O, cyber, management liability',
      contact: '1-800-BEAZLEY',
      website: 'https://www.beazley.com'
    },
    {
      name: 'Chubb',
      specialty: 'Management liability, cyber',
      contact: '1-800-CHUBB-PRO',
      website: 'https://www.chubb.com'
    }
  ]
};

// Sample insurance quote for TaskParent
export const TASKPARENT_SAMPLE_QUOTE = calculateInsuranceQuote({
  annualRevenue: 5000000, // $5M projected
  numberOfEmployees: 25,
  numberOfUsers: 75000,
  operatingStates: ['CA', 'NY', 'TX', 'FL', 'IL', 'WA', 'CO', 'NC', 'GA', 'AZ'],
  hasChildcareServices: true,
  dataStorageAmount: 'extensive'
});