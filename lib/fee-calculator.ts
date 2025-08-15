// BittieTasks Fee Calculator - Transparent fee structure implementation

export type TaskType = 'solo' | 'community' | 'barter' | 'corporate'

export interface FeeStructure {
  type: TaskType
  feePercentage: number
  description: string
  processingFeeFixed: number // Fixed processing fee in cents
}

export interface FeeCalculation {
  grossAmount: number
  platformFee: number
  processingFee: number
  netAmount: number
  feePercentage: number
  taskType: TaskType
  breakdown: {
    gross: string
    platformFee: string
    processingFee: string
    net: string
  }
}

// BittieTasks Transparent Fee Structure
export const FEE_STRUCTURES: Record<TaskType, FeeStructure> = {
  solo: {
    type: 'solo',
    feePercentage: 3.0,
    description: 'Platform-funded convenience tasks',
    processingFeeFixed: 30 // 30 cents Stripe processing fee
  },
  community: {
    type: 'community',
    feePercentage: 7.0,
    description: 'Peer-to-peer coordination and messaging',
    processingFeeFixed: 30
  },
  barter: {
    type: 'barter',
    feePercentage: 0.0,
    description: 'Direct value trading without fees',
    processingFeeFixed: 0 // No fees for barter
  },
  corporate: {
    type: 'corporate',
    feePercentage: 15.0,
    description: 'High-value corporate partnerships',
    processingFeeFixed: 30
  }
}

/**
 * Calculate transparent fee breakdown for BittieTasks
 */
export function calculateFees(grossAmount: number, taskType: TaskType): FeeCalculation {
  const feeStructure = FEE_STRUCTURES[taskType]
  
  // Convert gross amount to cents for precise calculations
  const grossCents = Math.round(grossAmount * 100)
  
  // Calculate platform fee
  const platformFeeCents = Math.round(grossCents * (feeStructure.feePercentage / 100))
  
  // Processing fee (fixed for most task types, 0 for barter)
  const processingFeeCents = feeStructure.processingFeeFixed
  
  // Net amount after all fees
  const netCents = grossCents - platformFeeCents - processingFeeCents
  
  // Convert back to dollars
  const platformFee = platformFeeCents / 100
  const processingFee = processingFeeCents / 100
  const netAmount = netCents / 100
  
  return {
    grossAmount,
    platformFee,
    processingFee,
    netAmount: Math.max(0, netAmount), // Ensure non-negative
    feePercentage: feeStructure.feePercentage,
    taskType,
    breakdown: {
      gross: formatCurrency(grossAmount),
      platformFee: formatCurrency(platformFee),
      processingFee: formatCurrency(processingFee),
      net: formatCurrency(Math.max(0, netAmount))
    }
  }
}

/**
 * Get minimum viable task amount for each type
 */
export function getMinimumTaskAmount(taskType: TaskType): number {
  const feeStructure = FEE_STRUCTURES[taskType]
  
  if (taskType === 'barter') {
    return 0 // Barter has no minimum
  }
  
  // Ensure net amount is at least $1 after all fees
  const minNetCents = 100 // $1.00
  const processingFeeCents = feeStructure.processingFeeFixed
  
  // Work backwards: gross = (net + processing) / (1 - platform_fee_rate)
  const grossCents = Math.ceil((minNetCents + processingFeeCents) / (1 - feeStructure.feePercentage / 100))
  
  return grossCents / 100
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Get fee structure display information
 */
export function getFeeDisplayInfo(taskType: TaskType) {
  const structure = FEE_STRUCTURES[taskType]
  return {
    ...structure,
    displayPercentage: structure.feePercentage === 0 ? 'FREE' : `${structure.feePercentage}%`,
    minimumAmount: getMinimumTaskAmount(taskType),
    formattedMinimum: formatCurrency(getMinimumTaskAmount(taskType))
  }
}

/**
 * Validate task amount meets minimum requirements
 */
export function validateTaskAmount(amount: number, taskType: TaskType): {
  valid: boolean
  error?: string
  suggestion?: string
} {
  const minimum = getMinimumTaskAmount(taskType)
  
  if (amount < minimum) {
    return {
      valid: false,
      error: `Minimum amount for ${taskType} tasks is ${formatCurrency(minimum)}`,
      suggestion: `Try ${formatCurrency(Math.ceil(minimum * 1.1))} or higher`
    }
  }
  
  if (amount > 10000) {
    return {
      valid: false,
      error: 'Maximum amount is $10,000 per task',
      suggestion: 'Consider breaking large tasks into smaller ones'
    }
  }
  
  return { valid: true }
}