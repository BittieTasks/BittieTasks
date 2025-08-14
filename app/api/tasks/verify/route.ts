import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

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

    // Create verification record
    const verification: TaskVerification = {
      taskId,
      userId,
      verificationPhoto,
      status: 'approved', // Auto-approve for demo purposes
      submissionDate: new Date().toISOString(),
      paymentIntentId: paymentIntent.id
    }

    taskVerifications.push(verification)

    // Update completion count
    userCompletionCounts[userKey] = currentCount + 1

    // For demo purposes, we'll simulate payment completion
    // In production, this would integrate with actual bank transfers or digital wallets

    return NextResponse.json({
      success: true,
      verification,
      payment: {
        amount: 2.00,
        currency: 'USD',
        status: 'completed',
        paymentIntentId: paymentIntent.id
      },
      completionCount: userCompletionCounts[userKey],
      remainingCompletions: 2 - userCompletionCounts[userKey],
      message: 'Task verified and payment processed successfully!'
    })

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

    // Get user's verifications
    const userVerifications = taskVerifications.filter(ver => ver.userId === userId)

    const approvedVerifications = userVerifications.filter(v => v.status === 'approved')
    return NextResponse.json({
      verifications: userVerifications,
      totalEarnings: approvedVerifications.length * 2
    })

  } catch (error) {
    console.error('Error fetching verifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch verifications' },
      { status: 500 }
    )
  }
}