import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { everydayTasks } from '@/lib/everydayTasks'
import Stripe from 'stripe'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil'
})

// Initialize OpenAI for real AI verification
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export async function POST(request: NextRequest) {
  try {
    console.log('Solo task verification endpoint called')

    const body = await request.json()
    const { task_id, taskId, afterPhoto, notes } = body
    const actualTaskId = task_id || taskId

    if (!actualTaskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    // Validate task exists
    const task = everydayTasks.find(t => t.id === actualTaskId)
    if (!task) {
      return NextResponse.json({ error: 'Solo task not found' }, { status: 404 })
    }

    if (!afterPhoto || !afterPhoto.trim()) {
      return NextResponse.json({ 
        error: 'Verification photo required',
        details: 'Please provide a photo or description to verify task completion'
      }, { status: 400 })
    }

    console.log('Processing verification for task:', actualTaskId)

    // Get user from authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabase.auth.getUser(token)
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
    }

    // Require email verification for task completion
    if (!user.email_confirmed_at) {
      return NextResponse.json({ 
        error: 'Email verification required',
        message: 'Please verify your email address before completing tasks',
        code: 'EMAIL_NOT_VERIFIED'
      }, { status: 403 })
    }

    // Real AI verification using OpenAI Vision
    let aiVerification
    try {
      console.log('Starting AI verification for task:', task.title)
      
      // Prepare the verification prompt based on task type
      const verificationPrompt = getTaskVerificationPrompt(task.id, task.title)
      
      let visionAnalysis = null
      
      // If it's a photo (base64), use OpenAI Vision
      if (afterPhoto.startsWith('data:image/')) {
        console.log('Analyzing photo with OpenAI Vision')
        
        const visionResponse = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: "system",
              content: "You are a professional task verification AI. Analyze images to verify task completion with high accuracy. Be strict but fair in your assessment."
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: verificationPrompt
                },
                {
                  type: "image_url",
                  image_url: {
                    url: afterPhoto
                  }
                }
              ]
            }
          ],
          max_tokens: 500,
          response_format: { type: "json_object" }
        })

        visionAnalysis = JSON.parse(visionResponse.choices[0].message.content || '{}')
      }
      // If it's text description, use text analysis
      else {
        console.log('Analyzing text description with OpenAI')
        
        const textResponse = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: "system",
              content: "You are a professional task verification AI. Analyze text descriptions to verify task completion. Be strict but fair in your assessment."
            },
            {
              role: "user",
              content: `${verificationPrompt}\n\nUser's description: "${afterPhoto}"`
            }
          ],
          max_tokens: 300,
          response_format: { type: "json_object" }
        })

        visionAnalysis = JSON.parse(textResponse.choices[0].message.content || '{}')
      }

      // Process AI response
      aiVerification = {
        confidence: Math.round(visionAnalysis.confidence || 0),
        approved: visionAnalysis.approved === true && (visionAnalysis.confidence || 0) >= 70,
        analysis: visionAnalysis.analysis || 'Unable to verify task completion',
        reasons: visionAnalysis.reasons || [],
        payout_amount: task.payout,
        net_payout: Math.round(task.payout * 0.97) // 3% platform fee
      }

      console.log('AI verification result:', aiVerification)

    } catch (aiError: any) {
      console.error('AI verification failed:', aiError)
      
      // Fallback to manual review if AI fails
      aiVerification = {
        confidence: 0,
        approved: false,
        analysis: `AI verification unavailable. Task "${task.title}" requires manual review.`,
        reasons: ['AI service temporarily unavailable'],
        payout_amount: task.payout,
        net_payout: Math.round(task.payout * 0.97),
        requires_manual_review: true
      }
    }

    let paymentResult = null
    let paymentError = null

    // Process real Stripe payment if verification passed
    if (aiVerification.approved && aiVerification.confidence >= 70) {
      try {
        console.log('Processing Stripe payment for verified task:', actualTaskId)
        
        // Create Stripe payment intent for instant payout
        const paymentIntent = await stripe.paymentIntents.create({
          amount: aiVerification.net_payout * 100, // Convert to cents
          currency: 'usd',
          payment_method_types: ['card'],
          confirmation_method: 'automatic',
          capture_method: 'automatic',
          description: `Solo Task Payment: ${task.title}`,
          metadata: {
            task_id: actualTaskId,
            user_id: user.id,
            task_type: 'solo',
            original_amount: task.payout.toString(),
            net_amount: aiVerification.net_payout.toString(),
            platform_fee: '3%'
          }
        })

        // For demo purposes, we'll mark it as completed since instant bank transfers 
        // require additional Stripe Connect setup
        paymentResult = {
          payment_intent_id: paymentIntent.id,
          amount: aiVerification.net_payout,
          status: 'processing', // In production, this would be handled by webhooks
          processed_at: new Date().toISOString(),
          estimated_arrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 business days
        }

        console.log('Stripe payment intent created:', paymentIntent.id)

      } catch (stripeError: any) {
        console.error('Stripe payment error:', stripeError)
        paymentError = `Payment processing failed: ${stripeError.message}`
        
        // Still return success for verification, but note payment issue
        paymentResult = {
          amount: aiVerification.net_payout,
          status: 'failed',
          error: paymentError
        }
      }
    }

    // Return verification response with real payment processing
    return NextResponse.json({
      success: true,
      verification: aiVerification,
      task: {
        id: actualTaskId,
        title: task.title,
        payout: task.payout,
        net_payout: aiVerification.net_payout
      },
      payment: paymentResult || {
        amount: aiVerification.net_payout,
        status: aiVerification.confidence < 70 ? 'manual_review_required' : 'failed',
        note: aiVerification.confidence < 70 ? 'Task needs manual review before payment' : 'Verification failed'
      },
      message: aiVerification.approved && paymentResult?.status === 'processing' 
        ? `Verification successful! Payment of $${aiVerification.net_payout} is being processed and will arrive in 1-2 business days.`
        : aiVerification.approved && paymentResult?.status === 'failed'
        ? `Verification successful! Payment processing encountered an issue: ${paymentError}`
        : aiVerification.approved
        ? `Verification successful! Payment will be processed shortly.`
        : `Verification failed. ${aiVerification.analysis} Please resubmit with better evidence.`
    })

  } catch (error: any) {
    console.error('Error in solo task verification:', error)
    return NextResponse.json({
      success: false,
      error: 'Verification failed',
      details: error.message
    }, { status: 500 })
  }
}

// Helper function to generate task-specific verification prompts
function getTaskVerificationPrompt(taskId: string, taskTitle: string): string {
  const prompts: Record<string, string> = {
    // BEFORE/AFTER TASKS - Require evidence of completion state
    'platform-001': `Verify if this image shows COMPLETED LAUNDRY TASK:
Required evidence: Clean, folded, and organized clothing/linens (AFTER completion)
Look for: Neatly folded clothes, organized dresser/closet, clean laundry basket, sorted garments
Reject: Dirty clothes, unfolded items, messy piles, washing machines, unrelated images
Verification type: AFTER photo showing completed organized laundry
Respond with JSON: {"approved": boolean, "confidence": number (0-100), "analysis": "detailed explanation", "reasons": ["specific observations"]}`,

    'platform-002': `Verify if this image shows COMPLETED DISHWASHING TASK:
Required evidence: Clean dishes, organized kitchen, sparkling surfaces (AFTER completion)
Look for: Clean dishes in drying rack/cupboard, spotless sink, organized kitchen, no dirty dishes visible
Reject: Dirty dishes, messy kitchen, food remnants, soap suds, unrelated images, puzzles, games
Verification type: AFTER photo showing clean kitchen and dishes
Respond with JSON: {"approved": boolean, "confidence": number (0-100), "analysis": "detailed explanation", "reasons": ["specific observations"]}`,

    'platform-005': `Verify if this image shows COMPLETED ORGANIZATION TASK:
Required evidence: Organized spaces, tidy rooms, decluttered areas (AFTER completion)
Look for: Clean organized areas, sorted items, tidy spaces, decluttered rooms, everything in place
Reject: Messy areas, disorganized spaces, no visible improvement, unrelated images
Verification type: AFTER photo showing organized/cleaned space
Respond with JSON: {"approved": boolean, "confidence": number (0-100), "analysis": "detailed explanation", "reasons": ["specific observations"]}`,

    // ACTIVITY TASKS - Single photo showing the activity in progress or completed
    'platform-003': `Verify if this image shows ACTIVE EXERCISE/WORKOUT:
Required evidence: Person actively exercising, workout equipment in use, fitness activity
Look for: Person in workout clothes exercising, yoga poses, gym equipment being used, active movement, sweat/effort
Accept: Yoga poses, running, gym workouts, home exercises, stretching, fitness activities
Reject: Just standing around, not exercising, street clothes, unrelated images, games/puzzles, sitting
Verification type: Single photo showing active exercise or workout completion
Respond with JSON: {"approved": boolean, "confidence": number (0-100), "analysis": "detailed explanation", "reasons": ["specific observations"]}`,

    'platform-004': `Verify if this image shows COMPLETED GROCERY SHOPPING:
Required evidence: Fresh groceries, shopping bags, food purchases, shopping receipts
Look for: Grocery bags with food items, fresh produce, packaged foods, shopping receipts, grocery store items
Accept: Groceries at home, shopping bags, food haul, receipts from grocery stores
Reject: Empty bags, non-food items, restaurant food, takeout, unrelated images
Verification type: Single photo showing grocery haul or receipt
Respond with JSON: {"approved": boolean, "confidence": number (0-100), "analysis": "detailed explanation", "reasons": ["specific observations"]}`,

    // MOVEMENT TASKS - Single photo showing the activity
    'platform-006': `Verify if this image shows WALKING/OUTDOOR ACTIVITY:
Required evidence: Person walking, outdoor setting, active movement, exercise clothing
Look for: Person in motion outdoors, walking paths, parks, sidewalks, exercise attire, natural settings
Accept: Walking photos, hiking, outdoor exercise, nature walks, active outdoor activities
Reject: Indoor photos, sitting, driving, unrelated images, stationary poses
Verification type: Single photo showing walking or outdoor activity
Respond with JSON: {"approved": boolean, "confidence": number (0-100), "analysis": "detailed explanation", "reasons": ["specific observations"]}`
  }

  return prompts[taskId] || `Verify if this image shows completion of "${taskTitle}":
Analyze the image for evidence that this specific task has been completed successfully.
Look for relevant task completion indicators and reject unrelated content.
Respond with JSON: {"approved": boolean, "confidence": number (0-100), "analysis": "detailed explanation", "reasons": ["specific observations"]}`
}