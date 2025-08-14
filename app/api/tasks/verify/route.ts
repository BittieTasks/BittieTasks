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

    // Create Stripe payment intent for $2 payout
    const stripe = getStripe()
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 200, // $2.00 in cents
      currency: 'usd',
      description: `BittieTasks platform payment for task completion: ${taskId}`,
      metadata: {
        taskId,
        userId,
        platform_funded: 'true'
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

    // Create verification record with AI analysis results
    const verificationRecord: TaskVerification = {
      taskId,
      userId,
      verificationPhoto,
      status: isAutoApproved ? 'approved' : (confidence > 0.3 ? 'pending' : 'rejected'),
      submissionDate: new Date().toISOString(),
      paymentIntentId: paymentIntent.id
    }

    taskVerifications.push(verificationRecord)

    // Handle payment based on verification status
    if (verificationRecord.status === 'approved') {
      // Auto-approved: Process payment immediately
      userCompletionCounts[userKey] = currentCount + 1
      
      return NextResponse.json({
        success: true,
        verification: verificationRecord,
        aiAnalysis: {
          confidence: Math.round(confidence * 100),
          reasoning: reasoning,
          autoApproved: true,
          detectedObjects: verification.detectedObjects || []
        },
        payment: {
          amount: 2.00,
          currency: 'USD',
          status: 'completed',
          paymentIntentId: paymentIntent.id
        },
        completionCount: userCompletionCounts[userKey],
        remainingCompletions: 2 - userCompletionCounts[userKey],
        message: `✅ AI Verified & Paid! Confidence: ${Math.round(confidence * 100)}% - ${reasoning}`
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
          amount: 2.00,
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