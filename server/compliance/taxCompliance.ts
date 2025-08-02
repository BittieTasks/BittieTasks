// Tax Compliance Framework for TaskParent

export interface TaxObligation {
  type: string;
  description: string;
  frequency: string;
  deadline: string;
  penalty: string;
  responsible: string;
  estimatedCost?: string;
}

export interface StateTaxRequirement {
  state: string;
  requirements: {
    businessRegistration: boolean;
    salesTax: boolean;
    incomeTax: boolean;
    unemploymentTax: boolean;
    workersComp: boolean;
    specialRequirements?: string[];
  };
  nexusThreshold?: {
    revenue?: number;
    transactions?: number;
    employees?: number;
  };
}

// Federal Tax Obligations
export const FEDERAL_TAX_OBLIGATIONS: TaxObligation[] = [
  {
    type: 'Income Tax',
    description: 'Corporate income tax on net profits',
    frequency: 'Quarterly estimated, Annual return',
    deadline: '15th day of 4th month after quarter/year end',
    penalty: '0.5% per month of unpaid tax',
    responsible: 'CFO/Tax Preparer',
    estimatedCost: '21% of taxable income'
  },
  {
    type: 'Employment Taxes',
    description: 'Federal income tax withholding, Social Security, Medicare',
    frequency: 'Monthly/Semi-weekly deposits, Quarterly returns',
    deadline: 'Deposit: 15th of following month, Return: Last day of month after quarter',
    penalty: '2-15% of unpaid tax depending on days late',
    responsible: 'Payroll Administrator',
    estimatedCost: '7.65% employer portion + withheld amounts'
  },
  {
    type: 'FUTA Tax',
    description: 'Federal Unemployment Tax Act contributions',
    frequency: 'Quarterly if liability exceeds $500',
    deadline: 'Last day of month after quarter end',
    penalty: '0.5% per month of unpaid tax',
    responsible: 'Payroll Administrator',
    estimatedCost: '6% on first $7,000 of wages (0.6% effective rate with state credit)'
  },
  {
    type: '1099 Reporting',
    description: 'Issue 1099-NEC for contractor payments over $600',
    frequency: 'Annual',
    deadline: 'January 31st for recipients, February 28th/March 31st for IRS',
    penalty: '$50-$280 per missing/incorrect form',
    responsible: 'Accounting Department',
    estimatedCost: '$50-100 per form for processing'
  },
  {
    type: 'Information Returns',
    description: 'Various information returns (1099-MISC, 1099-K, etc.)',
    frequency: 'Annual',
    deadline: 'January 31st - March 31st depending on form',
    penalty: '$50-$280 per missing/incorrect form',
    responsible: 'Tax Compliance Officer',
    estimatedCost: 'Administrative costs only'
  }
];

// State Tax Requirements by Key States
export const STATE_TAX_REQUIREMENTS: StateTaxRequirement[] = [
  {
    state: 'California',
    requirements: {
      businessRegistration: true,
      salesTax: true,
      incomeTax: true,
      unemploymentTax: true,
      workersComp: true,
      specialRequirements: [
        'California Privacy Rights Act compliance',
        'Paid Family Leave contributions',
        'Disability Insurance contributions',
        'Employment Training Tax'
      ]
    },
    nexusThreshold: {
      revenue: 500000,
      transactions: 200,
      employees: 1
    }
  },
  {
    state: 'New York',
    requirements: {
      businessRegistration: true,
      salesTax: true,
      incomeTax: true,
      unemploymentTax: true,
      workersComp: true,
      specialRequirements: [
        'Metropolitan Commuter Transportation Mobility Tax',
        'Paid Family Leave',
        'Disability Benefits Law',
        'NYC Commercial Rent Tax (if applicable)'
      ]
    },
    nexusThreshold: {
      revenue: 500000,
      transactions: 100,
      employees: 1
    }
  },
  {
    state: 'Texas',
    requirements: {
      businessRegistration: true,
      salesTax: true,
      incomeTax: false, // No state income tax
      unemploymentTax: true,
      workersComp: false, // Not required but recommended
      specialRequirements: [
        'Franchise Tax (margin tax)',
        'Mixed Beverage Tax (if applicable)',
        'Hotel Occupancy Tax (if applicable)'
      ]
    },
    nexusThreshold: {
      revenue: 500000,
      transactions: 200,
      employees: 1
    }
  },
  {
    state: 'Florida',
    requirements: {
      businessRegistration: true,
      salesTax: true,
      incomeTax: false, // No state income tax
      unemploymentTax: true,
      workersComp: true,
      specialRequirements: [
        'Communications Services Tax',
        'Documentary Stamp Tax',
        'Intangible Personal Property Tax'
      ]
    },
    nexusThreshold: {
      revenue: 100000,
      transactions: 200,
      employees: 1
    }
  },
  {
    state: 'Illinois',
    requirements: {
      businessRegistration: true,
      salesTax: true,
      incomeTax: true,
      unemploymentTax: true,
      workersComp: true,
      specialRequirements: [
        'Personal Property Replacement Tax',
        'Chicago taxes (if applicable)',
        'Municipal utility taxes'
      ]
    },
    nexusThreshold: {
      revenue: 100000,
      transactions: 200,
      employees: 1
    }
  }
];

// Tax Compliance Calendar
export interface TaxDeadline {
  date: string;
  description: string;
  type: 'federal' | 'state' | 'local';
  applicableStates?: string[];
  penalty: string;
}

export const TAX_COMPLIANCE_CALENDAR: TaxDeadline[] = [
  {
    date: 'January 15',
    description: 'Q4 estimated tax payments due',
    type: 'federal',
    penalty: '0.5% per month underpayment penalty'
  },
  {
    date: 'January 31',
    description: '1099 forms due to recipients',
    type: 'federal',
    penalty: '$50-$280 per missing form'
  },
  {
    date: 'January 31',
    description: 'Q4 employment tax returns due (Form 941)',
    type: 'federal',
    penalty: '0.5% per month of unpaid tax'
  },
  {
    date: 'February 28',
    description: '1099 forms due to IRS (paper filing)',
    type: 'federal',
    penalty: '$50-$280 per missing form'
  },
  {
    date: 'March 15',
    description: 'S-Corp tax returns due (Form 1120S)',
    type: 'federal',
    penalty: '$210 per month per shareholder'
  },
  {
    date: 'March 31',
    description: '1099 forms due to IRS (electronic filing)',
    type: 'federal',
    penalty: '$50-$280 per missing form'
  },
  {
    date: 'April 15',
    description: 'C-Corp tax returns due (Form 1120), Q1 estimated payments',
    type: 'federal',
    penalty: 'Varies by violation'
  },
  {
    date: 'April 30',
    description: 'Q1 employment tax returns due (Form 941)',
    type: 'federal',
    penalty: '0.5% per month of unpaid tax'
  },
  {
    date: 'June 15',
    description: 'Q2 estimated tax payments due',
    type: 'federal',
    penalty: '0.5% per month underpayment penalty'
  },
  {
    date: 'July 31',
    description: 'Q2 employment tax returns due (Form 941)',
    type: 'federal',
    penalty: '0.5% per month of unpaid tax'
  },
  {
    date: 'September 15',
    description: 'Q3 estimated tax payments due',
    type: 'federal',
    penalty: '0.5% per month underpayment penalty'
  },
  {
    date: 'October 31',
    description: 'Q3 employment tax returns due (Form 941)',
    type: 'federal',
    penalty: '0.5% per month of unpaid tax'
  }
];

// Tax Software and Service Providers
export const TAX_SERVICE_PROVIDERS = {
  software: [
    {
      name: 'Avalara',
      specialty: 'Sales tax automation and compliance',
      cost: '$19-99/month',
      features: ['Multi-state sales tax', 'API integration', 'Filing automation']
    },
    {
      name: 'TaxJar',
      specialty: 'E-commerce sales tax',
      cost: '$19-99/month',
      features: ['Sales tax calculations', 'Filing services', 'Nexus monitoring']
    },
    {
      name: 'Vertex',
      specialty: 'Enterprise tax technology',
      cost: 'Custom pricing',
      features: ['Indirect tax', 'Direct tax', 'Tax data management']
    }
  ],
  preparers: [
    {
      name: 'BDO',
      specialty: 'Technology company taxation',
      cost: '$5,000-50,000/year',
      services: ['Tax preparation', 'Tax planning', 'Compliance consulting']
    },
    {
      name: 'RSM',
      specialty: 'Middle market tax services',
      cost: '$3,000-30,000/year',
      services: ['Multi-state tax', 'R&D credits', 'State incentives']
    },
    {
      name: 'Grant Thornton',
      specialty: 'Platform economy taxation',
      cost: '$5,000-40,000/year',
      services: ['Tax compliance', 'International tax', 'Transfer pricing']
    }
  ]
};

// Calculate estimated tax liability
export function calculateEstimatedTaxLiability(params: {
  annualRevenue: number;
  businessExpenses: number;
  payrollExpenses: number;
  contractorPayments: number;
  operatingStates: string[];
  businessStructure: 'LLC' | 'C-Corp' | 'S-Corp';
}): {
  federal: number;
  state: number;
  total: number;
  breakdown: any;
} {
  
  const taxableIncome = params.annualRevenue - params.businessExpenses;
  
  // Federal income tax calculation
  let federalIncomeTax = 0;
  if (params.businessStructure === 'C-Corp') {
    federalIncomeTax = taxableIncome * 0.21; // 21% corporate rate
  } else {
    // Pass-through entity - depends on owner's tax rate
    federalIncomeTax = taxableIncome * 0.25; // Estimated average rate
  }
  
  // Employment taxes (if employees)
  const employmentTaxes = params.payrollExpenses * 0.0765; // 7.65% employer portion
  
  // Self-employment tax (for LLC/S-Corp owners)
  const selfEmploymentTax = params.businessStructure === 'LLC' ? 
    taxableIncome * 0.1413 : 0; // 14.13% SE tax rate
  
  const totalFederal = federalIncomeTax + employmentTaxes + selfEmploymentTax;
  
  // State tax calculation (simplified - varies significantly by state)
  const avgStateTaxRate = 0.06; // 6% average
  const stateTax = taxableIncome * avgStateTaxRate * params.operatingStates.length / 50;
  
  return {
    federal: Math.round(totalFederal),
    state: Math.round(stateTax),
    total: Math.round(totalFederal + stateTax),
    breakdown: {
      federalIncomeTax: Math.round(federalIncomeTax),
      employmentTaxes: Math.round(employmentTaxes),
      selfEmploymentTax: Math.round(selfEmploymentTax),
      stateTax: Math.round(stateTax)
    }
  };
}

// TaskParent specific tax compliance recommendations
export const TASKPARENT_TAX_COMPLIANCE = {
  businessStructure: {
    recommended: 'Delaware C-Corporation',
    reasons: [
      'Best for raising investment capital',
      'Favorable corporate law',
      'Stock option plans for employees',
      'Clear tax treatment'
    ],
    taxImplications: [
      'Double taxation on profits and dividends',
      '21% federal corporate income tax rate',
      'Quarterly estimated tax payments required',
      'Complex state apportionment issues'
    ]
  },
  multiStateCompliance: {
    priority: 'High',
    requirements: [
      'Register in each state of operation',
      'Monitor nexus thresholds',
      'File state income tax returns',
      'Collect and remit sales tax where applicable',
      'Comply with employment tax requirements'
    ],
    estimatedCosts: {
      registrationFees: '$100-800 per state',
      annualReports: '$50-500 per state',
      taxPreparationFees: '$1,000-5,000 per state',
      complianceSoftware: '$500-2,000 per month'
    }
  },
  contractorReporting: {
    volume: 'High - thousands of 1099s annually',
    requirements: [
      'Issue 1099-NEC for payments over $600',
      'Collect W-9 forms from all contractors',
      'File information returns with IRS',
      'Handle backup withholding if needed'
    ],
    automation: 'Strongly recommended due to volume',
    estimatedCosts: '$5,000-15,000 annually for processing'
  },
  salesTaxConsiderations: {
    applicability: 'Platform service fees may be taxable',
    complexity: 'High - varies by state and service type',
    requirements: [
      'Determine nexus in each state',
      'Register for sales tax permits',
      'Collect tax on applicable transactions',
      'File monthly/quarterly returns'
    ],
    recommendation: 'Engage sales tax specialist immediately'
  }
};

// Sample tax calculation for TaskParent
export const TASKPARENT_SAMPLE_TAX_CALCULATION = calculateEstimatedTaxLiability({
  annualRevenue: 5000000, // $5M projected
  businessExpenses: 3500000, // $3.5M in expenses
  payrollExpenses: 1000000, // $1M in payroll
  contractorPayments: 2000000, // $2M to contractors
  operatingStates: ['CA', 'NY', 'TX', 'FL', 'IL', 'WA', 'CO', 'NC', 'GA', 'AZ'],
  businessStructure: 'C-Corp'
});