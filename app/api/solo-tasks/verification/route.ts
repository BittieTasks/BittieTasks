import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      task_id, 
      completion_description, 
      verification_photos = [], 
      completion_notes 
    } = body

    // Validate required fields
    if (!task_id || !completion_description) {
      return NextResponse.json({ 
        error: 'Missing required fields: task_id and completion_description' 
      }, { status: 400 })
    }

    // Check if user is participant
    const { data: participant, error: participantError } = await supabase
      .from('task_participants')
      .select('*')
      .eq('task_id', task_id)
      .eq('user_id', user.id)
      .single()

    if (participantError || !participant) {
      return NextResponse.json({ 
        error: 'Not authorized - must be task participant' 
      }, { status: 403 })
    }

    // Check if already verified
    const { data: existingVerification } = await supabase
      .from('task_verifications')
      .select('id')
      .eq('task_id', task_id)
      .eq('user_id', user.id)
      .single()

    if (existingVerification) {
      return NextResponse.json({ 
        error: 'Task already submitted for verification' 
      }, { status: 400 })
    }

    // AI Verification for solo tasks
    let aiVerificationScore = 0
    let aiAnalysis = 'No AI analysis available'
    
    if (verification_photos.length > 0) {
      try {
        const prompt = `
          Analyze this task completion for a solo task on BittieTasks marketplace.
          Task Description: ${completion_description}
          Completion Notes: ${completion_notes || 'No additional notes'}
          
          Rate the completion quality from 0-100 considering:
          1. Evidence of actual work completed
          2. Quality and thoroughness of execution  
          3. Clear documentation/proof provided
          4. Professional presentation
          
          Return JSON format: {"score": number, "analysis": "brief explanation", "approved": boolean}
        `

        const response = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: { url: verification_photos[0] }
                }
              ]
            }
          ],
          response_format: { type: "json_object" },
          max_tokens: 500
        })

        const aiResult = JSON.parse(response.choices[0].message.content || '{}')
        aiVerificationScore = aiResult.score || 0
        aiAnalysis = aiResult.analysis || 'AI analysis completed'

      } catch (aiError) {
        console.error('AI verification error:', aiError)
        // Continue without AI analysis
      }
    }

    // Auto-approve solo tasks with reasonable completion
    const isAutoApproved = aiVerificationScore >= 70 || !verification_photos.length
    const verificationStatus = isAutoApproved ? 'verified' : 'manual_review'

    // Create verification record
    const { data: verification, error: verificationError } = await supabase
      .from('task_verifications')
      .insert({
        task_id,
        user_id: user.id,
        completion_description,
        completion_notes,
        verification_photos,
        ai_verification_score: aiVerificationScore,
        ai_analysis,
        status: verificationStatus,
        verified_at: isAutoApproved ? new Date().toISOString() : null,
        verified_by: isAutoApproved ? 'system_ai' : null
      })
      .select()
      .single()

    if (verificationError) {
      console.error('Verification creation error:', verificationError)
      return NextResponse.json({ 
        error: 'Failed to create verification',
        details: verificationError.message 
      }, { status: 500 })
    }

    // Update task participant status
    await supabase
      .from('task_participants')
      .update({
        status: isAutoApproved ? 'completed' : 'pending_verification',
        completed_at: isAutoApproved ? new Date().toISOString() : null
      })
      .eq('task_id', task_id)
      .eq('user_id', user.id)

    // If auto-approved, process payment
    let paymentResult = null
    if (isAutoApproved) {
      try {
        // Calculate payment details
        const grossAmount = participant.payout || 50 // Default fallback
        const platformFee = Math.round(grossAmount * 0.03) // 3% for solo tasks
        const netAmount = grossAmount - platformFee

        // Create transaction record
        const { data: transaction, error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            task_id,
            type: 'task_completion',
            amount: netAmount,
            fee_amount: platformFee,
            gross_amount: grossAmount,
            status: 'completed',
            processed_at: new Date().toISOString()
          })
          .select()
          .single()

        if (!transactionError) {
          // Update user earnings
          await supabase.rpc('update_user_earnings', {
            user_id: user.id,
            amount: netAmount
          })

          paymentResult = {
            transaction_id: transaction.id,
            net_amount: netAmount,
            platform_fee: platformFee,
            gross_amount: grossAmount
          }
        }
      } catch (paymentError) {
        console.error('Payment processing error:', paymentError)
        // Continue without payment - can be processed manually
      }
    }

    return NextResponse.json({
      success: true,
      verification,
      auto_approved: isAutoApproved,
      ai_score: aiVerificationScore,
      payment: paymentResult,
      message: isAutoApproved 
        ? 'Task verified and payment processed! Great work.'
        : 'Task submitted for manual review. You\'ll be notified when approved.'
    })

  } catch (error: any) {
    console.error('Solo task verification error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to verify task completion',
      details: error.message
    }, { status: 500 })
  }
}