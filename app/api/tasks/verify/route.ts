import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe with proper error handling for build
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

interface TaskVerification {
  taskId: string
  userId: string
  verificationPhoto: string
  status: 'pending' | 'approved' | 'rejected'
  submissionDate: string
  submissionTime: string
  completionDate: string
  completionTime: string
  processingTime: number // milliseconds from submission to approval
  paymentIntentId?: string
}

// Mock storage for task verifications
let taskVerifications: TaskVerification[] = []
let userCompletionCounts: Record<string, number> = {}

export async function POST(request: NextRequest) {
  try {
    const { taskId, userId, verificationPhoto } = await request.json()

    if (!taskId || !userId || !verificationPhoto) {
      return NextResponse.json(
        { error: 'Task ID, User ID, and verification photo are required' },
        { status: 400 }
      )
    }

    // Check completion limit (2 per task per user)
    const userKey = `${userId}-${taskId}`
    const currentCount = userCompletionCounts[userKey] || 0
    
    if (currentCount >= 2) {
      return NextResponse.json(
        { error: 'You have already completed this task the maximum number of times (2)' },
        { status: 400 }
      )
    }

    // Get the correct task pricing from the task ID
    const taskPricing: Record<string, number> = {
      'platform-001': 20, // Laundry Day
      'platform-002': 15, // Kitchen Clean-Up
      'platform-003': 12, // Pilates Session
      'platform-004': 25, // Grocery Run
      'platform-005': 30, // Room Organization
      'platform-006': 18, // Deep Clean Bathroom
      'platform-007': 10, // Morning Yoga Flow
      'platform-008': 35, // Meal Prep Session
      'platform-009': 28, // Closet Deep Clean
      'platform-010': 22, // Vehicle Exterior Wash
      'platform-011': 8,  // Meditation & Journaling
      'platform-012': 14, // Garden/Plant Care
      'platform-013': 11, // Digital Detox Walk
      'platform-014': 16, // Home Office Organization
      'platform-015': 13  // Self-Care Spa Hour
    }

    const taskPayout = taskPricing[taskId] || 2 // fallback to $2 for unknown tasks
    const processingFeeRate = 0.03 // 3% processing fee for solo tasks
    const processingFee = taskPayout * processingFeeRate
    const netPayout = taskPayout - processingFee
    
    // Create Stripe payment intent for net payout (after 3% processing fee)
    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(netPayout * 100), // Convert dollars to cents
      currency: 'usd',
      description: `BittieTasks solo task payment for: ${taskId} (Net: $${netPayout.toFixed(2)}, Fee: $${processingFee.toFixed(2)})`,
      metadata: {
        taskId,
        userId,
        platform_funded: 'true',
        grossAmount: taskPayout,
        processingFee: processingFee.toFixed(2),
        netAmount: netPayout.toFixed(2),
        feeRate: '3%'
      }
    })

    // Verify photo using AI analysis
    let photoResult: any = { verification: { autoApproved: false, confidence: 0, reasoning: 'No verification performed' } }
    
    try {
      const photoVerificationResponse = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:5000'}/api/tasks/photo-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          photoUrl: verificationPhoto,
          description: verificationPhoto
        })
      })
      
      if (photoVerificationResponse.ok) {
        photoResult = await photoVerificationResponse.json()
      }
    } catch (error) {
      console.error('Photo verification failed, falling back to manual review:', error)
    }

    const verification = photoResult.verification || {}
    const isAutoApproved = verification.autoApproved || false
    const confidence = verification.confidence || 0
    const reasoning = verification.reasoning || 'Manual review required'

    // Create verification record with detailed timestamps
    const now = new Date()
    const submissionTime = Date.now()
    const verificationRecord: TaskVerification = {
      taskId,
      userId,
      verificationPhoto,
      status: isAutoApproved ? 'approved' : (confidence > 0.3 ? 'pending' : 'rejected'),
      submissionDate: now.toISOString(),
      submissionTime: now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
      }),
      completionDate: now.toDateString(),
      completionTime: now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      processingTime: 0, // Will be updated when approved
      paymentIntentId: paymentIntent.id
    }

    taskVerifications.push(verificationRecord)

    // Handle payment based on verification status
    if (verificationRecord.status === 'approved') {
      // Auto-approved: Process payment immediately
      const approvalTime = Date.now()
      verificationRecord.processingTime = approvalTime - submissionTime
      userCompletionCounts[userKey] = currentCount + 1
      
      return NextResponse.json({
        success: true,
        verification: verificationRecord,
        timing: {
          submittedAt: verificationRecord.submissionTime,
          approvedAt: new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            hour12: true 
          }),
          processingTime: `${verificationRecord.processingTime}ms`,
          sameDay: true
        },
        aiAnalysis: {
          confidence: Math.round(confidence * 100),
          reasoning: reasoning,
          autoApproved: true,
          detectedObjects: verification.detectedObjects || []
        },
        payment: {
          grossAmount: taskPayout,
          processingFee: processingFee,
          netAmount: netPayout,
          currency: 'USD',
          status: 'completed',
          paymentIntentId: paymentIntent.id
        },
        completionCount: userCompletionCounts[userKey],
        remainingCompletions: 2 - userCompletionCounts[userKey],
        message: `✅ AI Verified & Paid $${netPayout.toFixed(2)} in ${verificationRecord.processingTime}ms! (3% processing fee: $${processingFee.toFixed(2)}) - ${reasoning}`
      })
    } else if (verificationRecord.status === 'pending') {
      // Pending manual review
      return NextResponse.json({
        success: true,
        verification: verificationRecord,
        aiAnalysis: {
          confidence: Math.round(confidence * 100),
          reasoning: reasoning,
          autoApproved: false,
          requiresReview: true
        },
        payment: {
          grossAmount: taskPayout,
          processingFee: processingFee,
          netAmount: netPayout,
          currency: 'USD',
          status: 'pending',
          paymentIntentId: paymentIntent.id
        },
        message: `🔍 Under Review - Confidence: ${Math.round(confidence * 100)}%. Payment pending manual verification.`
      })
    } else {
      // Rejected
      return NextResponse.json({
        success: false,
        verification: verificationRecord,
        aiAnalysis: {
          confidence: Math.round(confidence * 100),
          reasoning: reasoning,
          autoApproved: false,
          rejected: true
        },
        error: `❌ Verification Failed - ${reasoning}. Please provide clearer evidence of task completion.`
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Error verifying task:', error)
    return NextResponse.json(
      { error: 'Failed to verify task and process payment' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const userVerifications = taskVerifications.filter(v => v.userId === userId)
    
    return NextResponse.json({
      success: true,
      verifications: userVerifications,
      totalCompletions: userVerifications.length
    })

  } catch (error) {
    console.error('Error fetching verifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch verifications' },
      { status: 500 }
    )
  }
}