import { Request, Response, NextFunction } from 'express';

// Worker classification assessment based on IRS and DOL guidelines
export interface WorkerClassificationFactors {
  behavioralControl: BehavioralControlFactors;
  financialControl: FinancialControlFactors;
  relationshipFactors: RelationshipFactors;
}

interface BehavioralControlFactors {
  instructionsOnWork: 'none' | 'general' | 'detailed';
  trainingProvided: boolean;
  workScheduleControl: 'worker' | 'platform' | 'client';
  workLocationControl: 'worker' | 'platform' | 'client';
  toolsAndEquipment: 'worker_provides' | 'platform_provides' | 'client_provides';
}

interface FinancialControlFactors {
  paymentMethod: 'per_task' | 'hourly' | 'salary';
  businessExpenses: 'worker_pays' | 'platform_reimburses' | 'client_pays';
  investmentInWork: boolean;
  profitLossOpportunity: boolean;
  exclusiveWorkArrangement: boolean;
}

interface RelationshipFactors {
  writtenContract: boolean;
  benefitsProvided: boolean;
  permanencyOfRelationship: 'task_by_task' | 'ongoing' | 'permanent';
  keyActivityOfBusiness: boolean;
}

// Classification result
export interface ClassificationResult {
  classification: 'independent_contractor' | 'employee' | 'unclear';
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  factors: {
    contractorIndicators: string[];
    employeeIndicators: string[];
  };
  recommendations: string[];
  stateSpecificConsiderations: string[];
}

// TaskParent's worker classification framework
const TASKPARENT_CLASSIFICATION: WorkerClassificationFactors = {
  behavioralControl: {
    instructionsOnWork: 'general', // Platform provides general safety guidelines only
    trainingProvided: false, // No required training beyond safety orientation
    workScheduleControl: 'worker', // Workers set their own availability
    workLocationControl: 'client', // Work performed at client's location
    toolsAndEquipment: 'worker_provides', // Workers bring their own supplies
  },
  financialControl: {
    paymentMethod: 'per_task', // Payment per completed task
    businessExpenses: 'worker_pays', // Workers cover their own expenses
    investmentInWork: true, // Workers invest in their own supplies/transportation
    profitLossOpportunity: true, // Workers can accept/decline tasks
    exclusiveWorkArrangement: false, // Workers can work for other platforms
  },
  relationshipFactors: {
    writtenContract: true, // Clear independent contractor agreements
    benefitsProvided: false, // No employee benefits
    permanencyOfRelationship: 'task_by_task', // No ongoing employment relationship
    keyActivityOfBusiness: false, // Platform facilitates, doesn't provide services
  }
};

// Assess worker classification
export function assessWorkerClassification(factors: WorkerClassificationFactors): ClassificationResult {
  const contractorScore = calculateContractorScore(factors);
  const employeeScore = calculateEmployeeScore(factors);
  
  let classification: 'independent_contractor' | 'employee' | 'unclear';
  let confidence: number;
  
  if (contractorScore > employeeScore + 2) {
    classification = 'independent_contractor';
    confidence = Math.min(contractorScore / 10, 0.95);
  } else if (employeeScore > contractorScore + 2) {
    classification = 'employee';
    confidence = Math.min(employeeScore / 10, 0.95);
  } else {
    classification = 'unclear';
    confidence = 0.5;
  }
  
  const riskLevel = confidence > 0.8 ? 'low' : confidence > 0.6 ? 'medium' : 'high';
  
  return {
    classification,
    confidence,
    riskLevel,
    factors: {
      contractorIndicators: getContractorIndicators(factors),
      employeeIndicators: getEmployeeIndicators(factors),
    },
    recommendations: getRecommendations(classification, confidence),
    stateSpecificConsiderations: getStateConsiderations(),
  };
}

// Calculate contractor score (higher = more likely contractor)
function calculateContractorScore(factors: WorkerClassificationFactors): number {
  let score = 0;
  
  // Behavioral control factors
  if (factors.behavioralControl.instructionsOnWork === 'none') score += 2;
  if (factors.behavioralControl.instructionsOnWork === 'general') score += 1;
  if (!factors.behavioralControl.trainingProvided) score += 2;
  if (factors.behavioralControl.workScheduleControl === 'worker') score += 2;
  if (factors.behavioralControl.workLocationControl === 'client') score += 1;
  if (factors.behavioralControl.toolsAndEquipment === 'worker_provides') score += 2;
  
  // Financial control factors
  if (factors.financialControl.paymentMethod === 'per_task') score += 2;
  if (factors.financialControl.businessExpenses === 'worker_pays') score += 2;
  if (factors.financialControl.investmentInWork) score += 2;
  if (factors.financialControl.profitLossOpportunity) score += 2;
  if (!factors.financialControl.exclusiveWorkArrangement) score += 2;
  
  // Relationship factors
  if (factors.relationshipFactors.writtenContract) score += 1;
  if (!factors.relationshipFactors.benefitsProvided) score += 2;
  if (factors.relationshipFactors.permanencyOfRelationship === 'task_by_task') score += 2;
  if (!factors.relationshipFactors.keyActivityOfBusiness) score += 2;
  
  return score;
}

// Calculate employee score (higher = more likely employee)
function calculateEmployeeScore(factors: WorkerClassificationFactors): number {
  let score = 0;
  
  // Behavioral control factors
  if (factors.behavioralControl.instructionsOnWork === 'detailed') score += 2;
  if (factors.behavioralControl.trainingProvided) score += 2;
  if (factors.behavioralControl.workScheduleControl === 'platform') score += 2;
  if (factors.behavioralControl.workLocationControl === 'platform') score += 1;
  if (factors.behavioralControl.toolsAndEquipment === 'platform_provides') score += 2;
  
  // Financial control factors
  if (factors.financialControl.paymentMethod === 'hourly' || factors.financialControl.paymentMethod === 'salary') score += 2;
  if (factors.financialControl.businessExpenses === 'platform_reimburses') score += 2;
  if (!factors.financialControl.investmentInWork) score += 2;
  if (!factors.financialControl.profitLossOpportunity) score += 2;
  if (factors.financialControl.exclusiveWorkArrangement) score += 2;
  
  // Relationship factors
  if (factors.relationshipFactors.benefitsProvided) score += 2;
  if (factors.relationshipFactors.permanencyOfRelationship === 'ongoing' || factors.relationshipFactors.permanencyOfRelationship === 'permanent') score += 2;
  if (factors.relationshipFactors.keyActivityOfBusiness) score += 2;
  
  return score;
}

// Get contractor indicators
function getContractorIndicators(factors: WorkerClassificationFactors): string[] {
  const indicators: string[] = [];
  
  if (factors.behavioralControl.workScheduleControl === 'worker') {
    indicators.push('Worker controls their own schedule');
  }
  if (factors.behavioralControl.toolsAndEquipment === 'worker_provides') {
    indicators.push('Worker provides their own tools and equipment');
  }
  if (factors.financialControl.paymentMethod === 'per_task') {
    indicators.push('Payment made per completed task');
  }
  if (factors.financialControl.profitLossOpportunity) {
    indicators.push('Worker has opportunity for profit or loss');
  }
  if (!factors.financialControl.exclusiveWorkArrangement) {
    indicators.push('Worker can work for other platforms');
  }
  if (!factors.relationshipFactors.benefitsProvided) {
    indicators.push('No employee benefits provided');
  }
  if (factors.relationshipFactors.permanencyOfRelationship === 'task_by_task') {
    indicators.push('Task-by-task work relationship');
  }
  
  return indicators;
}

// Get employee indicators  
function getEmployeeIndicators(factors: WorkerClassificationFactors): string[] {
  const indicators: string[] = [];
  
  if (factors.behavioralControl.instructionsOnWork === 'detailed') {
    indicators.push('Detailed instructions provided on how work is performed');
  }
  if (factors.behavioralControl.trainingProvided) {
    indicators.push('Training provided by platform');
  }
  if (factors.financialControl.businessExpenses === 'platform_reimburses') {
    indicators.push('Platform reimburses business expenses');
  }
  if (factors.relationshipFactors.benefitsProvided) {
    indicators.push('Employee benefits provided');
  }
  if (factors.relationshipFactors.keyActivityOfBusiness) {
    indicators.push('Work is key activity of the business');
  }
  
  return indicators;
}

// Get recommendations for classification
function getRecommendations(classification: string, confidence: number): string[] {
  const recommendations: string[] = [];
  
  if (classification === 'employee' || confidence < 0.7) {
    recommendations.push('Consult with employment attorney for classification review');
    recommendations.push('Consider restructuring worker relationship to increase contractor factors');
    recommendations.push('Implement stronger contractor independence measures');
  }
  
  if (classification === 'independent_contractor') {
    recommendations.push('Maintain current contractor relationship structure');
    recommendations.push('Document contractor independence in written agreements');
    recommendations.push('Regular review of classification factors');
  }
  
  recommendations.push('Obtain workers\' compensation insurance');
  recommendations.push('Implement proper tax reporting (1099-NEC)');
  recommendations.push('Stay updated on state-specific worker classification laws');
  
  return recommendations;
}

// Get state-specific considerations
function getStateConsiderations(): string[] {
  return [
    'California AB5: Strict ABC test for contractor classification',
    'New York: Unemployment insurance law considerations',
    'Massachusetts: Independent contractor statute requirements',
    'New Jersey: ABC test for unemployment and disability insurance',
    'Illinois: Employee classification for wage and hour purposes',
    'Texas: Contractor agreements must meet specific requirements',
    'Florida: Workers\' compensation exemptions for contractors',
    'Washington: Gig worker protections and benefits requirements'
  ];
}

// Middleware to assess worker classification
export const assessClassification = (req: Request, res: Response, next: NextFunction) => {
  const assessment = assessWorkerClassification(TASKPARENT_CLASSIFICATION);
  
  // Log assessment for compliance monitoring
  console.log('Worker Classification Assessment:', {
    classification: assessment.classification,
    confidence: assessment.confidence,
    riskLevel: assessment.riskLevel
  });
  
  // Add assessment to request for use in other middleware
  (req as any).workerClassification = assessment;
  
  // If high risk, flag for legal review
  if (assessment.riskLevel === 'high') {
    console.warn('HIGH RISK worker classification detected - legal review recommended');
    (req as any).requiresLegalReview = true;
  }
  
  next();
};

// Generate worker classification report
export const generateClassificationReport = (req: Request, res: Response) => {
  const assessment = assessWorkerClassification(TASKPARENT_CLASSIFICATION);
  
  res.json({
    timestamp: new Date().toISOString(),
    platform: 'TaskParent',
    assessment: {
      classification: assessment.classification,
      confidence: Math.round(assessment.confidence * 100),
      riskLevel: assessment.riskLevel,
    },
    analysis: {
      contractorIndicators: assessment.factors.contractorIndicators,
      employeeIndicators: assessment.factors.employeeIndicators,
      recommendations: assessment.recommendations,
    },
    compliance: {
      stateConsiderations: assessment.stateSpecificConsiderations,
      requiredActions: [
        'Maintain written independent contractor agreements',
        'Issue 1099-NEC forms for payments over $600',
        'Obtain workers\' compensation coverage',
        'Regular legal review of classification factors'
      ]
    },
    disclaimer: 'This assessment is for informational purposes only and does not constitute legal advice. Consult with qualified employment attorney for specific classification determinations.'
  });
};

// Contractor agreement requirements
export const getContractorAgreementRequirements = (req: Request, res: Response) => {
  res.json({
    requiredClauses: [
      {
        title: 'Independent Contractor Status',
        description: 'Clear statement that worker is independent contractor, not employee',
        required: true
      },
      {
        title: 'Control and Direction',
        description: 'Worker controls manner and method of performing services',
        required: true
      },
      {
        title: 'Business Expenses',
        description: 'Worker responsible for own business expenses',
        required: true
      },
      {
        title: 'Tools and Equipment',
        description: 'Worker provides own tools and equipment',
        required: true
      },
      {
        title: 'Right to Refuse Work',
        description: 'Worker has right to accept or decline tasks',
        required: true
      },
      {
        title: 'No Benefits',
        description: 'No employee benefits provided (health, retirement, etc.)',
        required: true
      },
      {
        title: 'Tax Obligations',
        description: 'Worker responsible for own tax obligations',
        required: true
      },
      {
        title: 'Other Work',
        description: 'Worker free to work for other platforms/clients',
        required: true
      },
      {
        title: 'Termination',
        description: 'Either party can terminate without cause',
        required: true
      },
      {
        title: 'Indemnification',
        description: 'Worker indemnifies platform for their actions',
        required: true
      }
    ],
    stateSpecificRequirements: {
      california: [
        'Must meet ABC test criteria under AB5',
        'Specific language for gig worker exemptions',
        'Additional wage and hour disclosures'
      ],
      newYork: [
        'Unemployment insurance disclosures',
        'Workers\' compensation exemption documentation',
        'Specific contractor certification language'
      ],
      texas: [
        'Written agreement required for contractor status',
        'Specific payment terms and schedule',
        'Workers\' compensation exemption election'
      ]
    }
  });
};

export default {
  assessClassification,
  generateClassificationReport,
  getContractorAgreementRequirements,
  assessWorkerClassification,
};