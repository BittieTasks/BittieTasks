import { db } from './db'
import { tasks, taskApprovalLogs, prohibitedContent, users } from '../shared/schema'
import { eq, and, sql, desc } from 'drizzle-orm'

// Risk factors that affect approval
interface RiskFactors {
  prohibitedKeywords: string[]
  highPayout: boolean
  newUser: boolean
  suspiciousLocation: boolean
  repeatedRejections: boolean
}

interface AutomatedChecks {
  contentModeration: boolean
  payoutValidation: boolean
  locationCheck: boolean
  userHistory: boolean
  riskScore: number
}

export class TaskApprovalService {
  // Main approval pipeline
  static async processTaskApproval(taskId: string): Promise<{
    approved: boolean
    reviewTier: string
    riskScore: number
    reasons: string[]
  }> {
    const task = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1)
    if (!task.length) {
      throw new Error('Task not found')
    }

    const taskData = task[0]
    const riskFactors = await this.assessRiskFactors(taskData)
    const automatedChecks = await this.runAutomatedChecks(taskData, riskFactors)
    
    const riskScore = this.calculateRiskScore(riskFactors, automatedChecks)
    const reviewTier = this.determineReviewTier(riskScore, taskData)
    const approved = this.shouldAutoApprove(riskScore, reviewTier)

    // Log the approval decision
    await this.logApprovalDecision(taskId, approved, reviewTier, riskScore, riskFactors, automatedChecks)

    // Update task status
    await this.updateTaskApprovalStatus(taskId, approved, reviewTier, riskScore)

    return {
      approved,
      reviewTier,
      riskScore,
      reasons: this.getApprovalReasons(riskFactors, automatedChecks)
    }
  }

  // Assess risk factors for the task
  private static async assessRiskFactors(task: any): Promise<RiskFactors> {
    const prohibitedKeywords = await this.checkProhibitedContent(task.title, task.description)
    const highPayout = parseFloat(task.earningPotential) > 200
    const newUser = await this.isNewUser(task.hostId)
    const suspiciousLocation = this.checkSuspiciousLocation(task.location)
    const repeatedRejections = await this.hasRepeatedRejections(task.hostId)

    return {
      prohibitedKeywords,
      highPayout,
      newUser,
      suspiciousLocation,
      repeatedRejections
    }
  }

  // Run automated safety and content checks
  private static async runAutomatedChecks(task: any, riskFactors: RiskFactors): Promise<AutomatedChecks> {
    const contentModeration = riskFactors.prohibitedKeywords.length === 0
    const payoutValidation = this.validatePayout(task.earningPotential, task.type)
    const locationCheck = !riskFactors.suspiciousLocation
    const userHistory = !riskFactors.newUser && !riskFactors.repeatedRejections
    
    const riskScore = this.calculateRiskScore(riskFactors, {
      contentModeration,
      payoutValidation,
      locationCheck,
      userHistory,
      riskScore: 0
    })

    return {
      contentModeration,
      payoutValidation,
      locationCheck,
      userHistory,
      riskScore
    }
  }

  // Calculate overall risk score (0-100)
  private static calculateRiskScore(riskFactors: RiskFactors, automatedChecks: Partial<AutomatedChecks>): number {
    let score = 0

    // Prohibited content - highest risk
    if (riskFactors.prohibitedKeywords.length > 0) score += 40
    
    // High payout tasks need more scrutiny
    if (riskFactors.highPayout) score += 15
    
    // New users have higher risk
    if (riskFactors.newUser) score += 10
    
    // Suspicious locations
    if (riskFactors.suspiciousLocation) score += 10
    
    // Users with repeated rejections
    if (riskFactors.repeatedRejections) score += 20

    // Failed automated checks
    if (automatedChecks.contentModeration === false) score += 20
    if (automatedChecks.payoutValidation === false) score += 15
    if (automatedChecks.locationCheck === false) score += 10
    if (automatedChecks.userHistory === false) score += 15

    return Math.min(score, 100)
  }

  // Determine which review tier the task needs
  private static determineReviewTier(riskScore: number, task: any): string {
    // Corporate sponsored tasks always get corporate review
    if (task.sponsorId) return 'corporate_review'
    
    // High risk tasks need enhanced review
    if (riskScore >= 30) return 'enhanced_review'
    
    // Medium risk or high payout tasks need standard review
    if (riskScore >= 15 || parseFloat(task.earningPotential) > 50) return 'standard_review'
    
    // Low risk tasks can be auto-approved
    return 'auto_approve'
  }

  // Determine if task should be auto-approved
  private static shouldAutoApprove(riskScore: number, reviewTier: string): boolean {
    return reviewTier === 'auto_approve' && riskScore < 15
  }

  // Check for prohibited content in task title and description
  private static async checkProhibitedContent(title: string, description: string): Promise<string[]> {
    const content = `${title} ${description}`.toLowerCase()
    
    try {
      const prohibited = await db.select()
        .from(prohibitedContent)
        .where(eq(prohibitedContent.isActive, true))

      return prohibited
        .filter((item: any) => content.includes(item.keyword.toLowerCase()))
        .map((item: any) => item.keyword)
    } catch (error) {
      console.error('Error checking prohibited content:', error)
      return []
    }
  }

  // Check if user is new (created within last 7 days)
  private static async isNewUser(userId: string): Promise<boolean> {
    try {
      const user = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)

      if (!user.length) return true

      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      
      return new Date(user[0].createdAt!) > weekAgo
    } catch (error) {
      console.error('Error checking user age:', error)
      return true // Default to new user for safety
    }
  }

  // Check for suspicious location patterns
  private static checkSuspiciousLocation(location: string | null): boolean {
    if (!location) return false
    
    const suspicious = [
      'offshore', 'remote location', 'undisclosed', 'private residence',
      'cash only', 'no address', 'mobile', 'varies'
    ]
    
    const locationLower = location.toLowerCase()
    return suspicious.some(term => locationLower.includes(term))
  }

  // Check if user has repeated rejections
  private static async hasRepeatedRejections(userId: string): Promise<boolean> {
    try {
      const recentRejections = await db.select()
        .from(tasks)
        .where(and(
          eq(tasks.hostId, userId),
          eq(tasks.approvalStatus, 'rejected')
        ))
        .orderBy(desc(tasks.createdAt))
        .limit(5)

      return recentRejections.length >= 3
    } catch (error) {
      console.error('Error checking rejection history:', error)
      return false
    }
  }

  // Validate payout amount for task type
  private static validatePayout(earningPotential: string, taskType: string): boolean {
    const amount = parseFloat(earningPotential)
    
    // Set reasonable limits based on task type
    const limits = {
      solo: 200,
      shared: 300,
      sponsored: 500,
      barter: 100
    }
    
    const limit = limits[taskType as keyof typeof limits] || 200
    return amount <= limit && amount >= 5
  }

  // Log approval decision for audit trail
  private static async logApprovalDecision(
    taskId: string,
    approved: boolean,
    reviewTier: string,
    riskScore: number,
    riskFactors: RiskFactors,
    automatedChecks: AutomatedChecks
  ) {
    try {
      await db.insert(taskApprovalLogs).values({
        taskId,
        previousStatus: 'pending',
        newStatus: approved ? 'auto_approved' : 'manual_review',
        reviewedBy: 'system',
        reviewNotes: `Automated review completed. Risk score: ${riskScore}`,
        riskFactors: JSON.stringify(riskFactors),
        automatedChecks: automatedChecks
      })
    } catch (error) {
      console.error('Error logging approval decision:', error)
    }
  }

  // Update task approval status in database
  private static async updateTaskApprovalStatus(
    taskId: string,
    approved: boolean,
    reviewTier: string,
    riskScore: number
  ) {
    try {
      await db.update(tasks)
        .set({
          approvalStatus: approved ? 'auto_approved' : 'manual_review',
          reviewTier: reviewTier as any,
          riskScore,
          approvedAt: approved ? new Date() : undefined,
          approvedBy: approved ? 'system' : undefined
        })
        .where(eq(tasks.id, taskId))
    } catch (error) {
      console.error('Error updating task approval status:', error)
    }
  }

  // Get human-readable approval reasons
  private static getApprovalReasons(riskFactors: RiskFactors, automatedChecks: AutomatedChecks): string[] {
    const reasons: string[] = []

    if (riskFactors.prohibitedKeywords.length > 0) {
      reasons.push(`Contains prohibited content: ${riskFactors.prohibitedKeywords.join(', ')}`)
    }
    if (riskFactors.highPayout) {
      reasons.push('High payout amount requires review')
    }
    if (riskFactors.newUser) {
      reasons.push('New user - additional verification needed')
    }
    if (riskFactors.suspiciousLocation) {
      reasons.push('Location requires verification')
    }
    if (riskFactors.repeatedRejections) {
      reasons.push('User has recent rejected tasks')
    }
    if (!automatedChecks.contentModeration) {
      reasons.push('Content moderation check failed')
    }
    if (!automatedChecks.payoutValidation) {
      reasons.push('Payout amount outside normal range')
    }

    if (reasons.length === 0) {
      reasons.push('Automatically approved - meets all safety criteria')
    }

    return reasons
  }

  // Seed prohibited content database
  static async seedProhibitedContent() {
    const prohibitedItems = [
      // Childcare related
      { keyword: 'babysitting', category: 'childcare', severity: 10 },
      { keyword: 'childcare', category: 'childcare', severity: 10 },
      { keyword: 'nanny', category: 'childcare', severity: 10 },
      { keyword: 'daycare', category: 'childcare', severity: 10 },
      { keyword: 'kids supervision', category: 'childcare', severity: 10 },
      { keyword: 'child minding', category: 'childcare', severity: 10 },
      
      // Medical services
      { keyword: 'medical advice', category: 'medical', severity: 10 },
      { keyword: 'diagnosis', category: 'medical', severity: 10 },
      { keyword: 'prescription', category: 'medical', severity: 10 },
      { keyword: 'therapy session', category: 'medical', severity: 9 },
      { keyword: 'health treatment', category: 'medical', severity: 9 },
      
      // Legal services
      { keyword: 'legal advice', category: 'legal', severity: 10 },
      { keyword: 'law consultation', category: 'legal', severity: 10 },
      { keyword: 'court representation', category: 'legal', severity: 10 },
      { keyword: 'legal document', category: 'legal', severity: 8 },
      
      // Financial services
      { keyword: 'financial advice', category: 'financial', severity: 10 },
      { keyword: 'investment advice', category: 'financial', severity: 10 },
      { keyword: 'loan approval', category: 'financial', severity: 9 },
      { keyword: 'tax preparation', category: 'financial', severity: 8 },
      
      // Dangerous activities
      { keyword: 'dangerous', category: 'dangerous', severity: 9 },
      { keyword: 'illegal', category: 'dangerous', severity: 10 },
      { keyword: 'hazardous', category: 'dangerous', severity: 9 },
      { keyword: 'unsafe', category: 'dangerous', severity: 8 }
    ]

    try {
      for (const item of prohibitedItems) {
        await db.insert(prohibitedContent)
          .values(item)
          .onConflictDoNothing()
      }
      console.log('Prohibited content seeded successfully')
    } catch (error) {
      console.error('Error seeding prohibited content:', error)
    }
  }
}