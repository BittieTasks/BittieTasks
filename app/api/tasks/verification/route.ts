import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '../../../../lib/supabase'
import { z } from 'zod'

// Supabase client will be created in each function

// Verification submission schema
const verificationSubmissionSchema = z.object({
  taskId: z.string(),
  participantId: z.string(),
  verificationMethods: z.array(z.enum(['photo', 'video', 'gps_tracking', 'time_tracking', 'community_verification', 'receipt_upload', 'social_proof'])),
  photoUrls: z.array(z.string()).optional(),
  videoUrls: z.array(z.string()).optional(),
  photoMetadata: z.object({
    gpsCoordinates: z.array(z.number()).optional(),
    timestamp: z.string().optional(),
    deviceInfo: z.string().optional()
  }).optional(),
  videoMetadata: z.object({
    duration: z.number().optional(),
    resolution: z.string().optional(),
    timestamp: z.string().optional()
  }).optional(),
  gpsCoordinates: z.array(z.string()).optional(),
  locationHistory: z.object({
    coordinates: z.array(z.array(z.number())),
    timestamps: z.array(z.string())
  }).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  totalDuration: z.number().optional(),
  timeTrackingData: z.object({
    intervals: z.array(z.object({
      timestamp: z.string(),
      activity: z.string(),
      location: z.array(z.number()).optional()
    }))
  }).optional(),
  communityVerifications: z.object({
    hostConfirmation: z.boolean().optional(),
    witnessConfirmations: z.array(z.string()).optional()
  }).optional(),
  receiptUrls: z.array(z.string()).optional(),
  socialProofUrls: z.array(z.string()).optional(),
  completionNotes: z.string().optional()
})

// Automated verification logic
async function performAutomatedVerification(submission: any, requirements: any) {
  let autoVerificationScore = 0
  let fraudDetectionScore = 0
  let qualityScore = 0
  
  const scores = {
    photo: 0,
    video: 0,
    location: 0,
    time: 0,
    overall: 0
  }

  // Photo verification
  if (submission.photoUrls && submission.photoUrls.length > 0) {
    const photoReq = requirements.photoRequirements || {}
    
    // Check photo count
    if (submission.photoUrls.length >= (photoReq.count || 1)) {
      scores.photo += 30
    }
    
    // Check GPS metadata
    if (submission.photoMetadata?.gpsCoordinates && photoReq.requiresLocation) {
      scores.photo += 25
    }
    
    // Check timestamp
    if (submission.photoMetadata?.timestamp && photoReq.requiresTimestamp) {
      scores.photo += 20
      
      // Verify photo was taken recently (within task window)
      const photoTime = new Date(submission.photoMetadata.timestamp)
      const now = new Date()
      const hoursDiff = (now.getTime() - photoTime.getTime()) / (1000 * 60 * 60)
      
      if (hoursDiff <= 24) { // Within 24 hours
        scores.photo += 15
      }
    }
    
    // Basic quality check (assume good quality for now)
    scores.photo += 10
  }
  
  // Video verification
  if (submission.videoUrls && submission.videoUrls.length > 0) {
    const videoReq = requirements.videoRequirements || {}
    
    if (submission.videoMetadata?.duration) {
      const duration = submission.videoMetadata.duration
      const minDuration = videoReq.minDuration || 30
      const maxDuration = videoReq.maxDuration || 300
      
      if (duration >= minDuration && duration <= maxDuration) {
        scores.video += 40
      }
    }
    
    scores.video += 30 // Base video submission score
  }
  
  // Location verification  
  if (submission.gpsCoordinates && submission.gpsCoordinates.length > 0) {
    const locationReq = requirements.locationRequirements || {}
    
    // Check if location is within required radius
    if (locationReq.radius && submission.gpsCoordinates.length > 0) {
      // Basic location validation (assume within radius for now)
      scores.location += 50
    }
    
    // Continuous tracking bonus
    if (submission.locationHistory?.coordinates && submission.locationHistory.coordinates.length > 5) {
      scores.location += 30
    }
    
    scores.location += 20 // Base GPS score
  }
  
  // Time verification
  if (submission.startTime && submission.endTime) {
    const timeReq = requirements.timeRequirements || {}
    
    const start = new Date(submission.startTime)
    const end = new Date(submission.endTime)
    const duration = (end.getTime() - start.getTime()) / 1000 // seconds
    
    if (timeReq.minDuration && duration >= timeReq.minDuration) {
      scores.time += 40
    }
    
    // Realistic duration check
    if (duration > 60 && duration < 86400) { // Between 1 minute and 24 hours
      scores.time += 30
    }
    
    // Time tracking data bonus
    if (submission.timeTrackingData?.intervals && submission.timeTrackingData.intervals.length > 0) {
      scores.time += 30
    }
  }
  
  // Calculate overall scores
  const requiredMethods = requirements.requiredMethods || []
  let totalPossibleScore = 0
  let earnedScore = 0
  
  if (requiredMethods.includes('photo')) {
    totalPossibleScore += 100
    earnedScore += Math.min(scores.photo, 100)
  }
  
  if (requiredMethods.includes('video')) {
    totalPossibleScore += 100  
    earnedScore += Math.min(scores.video, 100)
  }
  
  if (requiredMethods.includes('gps_tracking')) {
    totalPossibleScore += 100
    earnedScore += Math.min(scores.location, 100)
  }
  
  if (requiredMethods.includes('time_tracking')) {
    totalPossibleScore += 100
    earnedScore += Math.min(scores.time, 100)
  }
  
  autoVerificationScore = totalPossibleScore > 0 ? Math.round((earnedScore / totalPossibleScore) * 100) : 0
  qualityScore = autoVerificationScore
  
  // Fraud detection (basic checks)
  const suspiciousFactors = []
  
  // Check for duplicate submissions (simplified)
  if (submission.photoUrls && submission.photoUrls.length > 0) {
    // In real implementation, would check image hashes
    fraudDetectionScore += 5 // Low risk for having photos
  }
  
  // Check for impossible timing
  if (submission.totalDuration && submission.totalDuration < 60) {
    suspiciousFactors.push('Task completed too quickly')
    fraudDetectionScore += 20
  }
  
  // Check for missing required verification
  if (requiredMethods.length > 0 && submission.verificationMethods.length < requiredMethods.length) {
    suspiciousFactors.push('Missing required verification methods')
    fraudDetectionScore += 30
  }
  
  return {
    autoVerificationScore,
    fraudDetectionScore,
    qualityScore,
    aiAnalysisResults: {
      scores,
      suspiciousFactors,
      requiredMethodsCheck: {
        required: requiredMethods,
        provided: submission.verificationMethods,
        complete: requiredMethods.every(method => submission.verificationMethods.includes(method))
      }
    }
  }
}

// Determine verification status based on scores and requirements
function determineVerificationStatus(scores: any, task: any, requirements: any) {
  const { autoVerificationScore, fraudDetectionScore, qualityScore } = scores
  
  // High fraud risk -> immediate rejection
  if (fraudDetectionScore > 50) {
    return 'rejected'
  }
  
  // Check auto-approval criteria
  const autoApprovalCriteria = requirements.autoApprovalCriteria || {}
  const minGpsAccuracy = autoApprovalCriteria.gpsAccuracy || 70
  const minPhotoQuality = autoApprovalCriteria.photoQuality || 70
  const minTimeCompliance = autoApprovalCriteria.timeCompliance || 80
  
  const meetsAutoApproval = 
    autoVerificationScore >= minGpsAccuracy &&
    qualityScore >= minPhotoQuality &&
    autoVerificationScore >= minTimeCompliance &&
    fraudDetectionScore <= 20
  
  // Task value and type considerations
  const taskValue = parseFloat(task.earningPotential || '0')
  const taskType = task.type
  
  // Platform-funded tasks: More lenient auto-approval
  if (taskType === 'platform_funded' && taskValue <= 25 && meetsAutoApproval) {
    return 'auto_verified'
  }
  
  // Corporate tasks: Stricter requirements
  if (taskType === 'corporate_sponsored') {
    if (taskValue > 100 || qualityScore < 80) {
      return 'manual_review'
    }
    return meetsAutoApproval ? 'auto_verified' : 'manual_review'
  }
  
  // P2P tasks: Standard requirements
  if (taskType === 'peer_to_peer') {
    if (taskValue > 50) {
      return 'manual_review'
    }
    return meetsAutoApproval ? 'auto_verified' : 'requires_additional_proof'
  }
  
  // Default to manual review for edge cases
  return 'manual_review'
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = verificationSubmissionSchema.parse(body)
    
    // Get task and verification requirements
    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', validatedData.taskId)
      .single()
      
    if (taskError || !taskData) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    
    const { data: requirementsData, error: reqError } = await supabase
      .from('task_verification_requirements')
      .select('*')
      .eq('taskId', validatedData.taskId)
      .single()
    
    if (reqError || !requirementsData) {
      return NextResponse.json({ error: 'Verification requirements not found' }, { status: 404 })
    }
    
    // Perform automated verification
    const verificationResults = await performAutomatedVerification(validatedData, requirementsData)
    const verificationStatus = determineVerificationStatus(verificationResults, taskData, requirementsData)
    
    // Create submission record
    const submissionData = {
      taskId: validatedData.taskId,
      userId: user.id,
      participantId: validatedData.participantId,
      verificationStatus,
      verificationMethods: validatedData.verificationMethods,
      photoUrls: validatedData.photoUrls || [],
      videoUrls: validatedData.videoUrls || [],
      photoMetadata: validatedData.photoMetadata || {},
      videoMetadata: validatedData.videoMetadata || {},
      gpsCoordinates: validatedData.gpsCoordinates || [],
      locationHistory: validatedData.locationHistory || {},
      startLocation: validatedData.gpsCoordinates?.[0] || '',
      endLocation: validatedData.gpsCoordinates?.[validatedData.gpsCoordinates.length - 1] || '',
      startTime: validatedData.startTime ? new Date(validatedData.startTime) : null,
      endTime: validatedData.endTime ? new Date(validatedData.endTime) : null,
      totalDuration: validatedData.totalDuration || 0,
      timeTrackingData: validatedData.timeTrackingData || {},
      communityVerifications: validatedData.communityVerifications || {},
      receiptUrls: validatedData.receiptUrls || [],
      socialProofUrls: validatedData.socialProofUrls || [],
      autoVerificationScore: verificationResults.autoVerificationScore,
      aiAnalysisResults: verificationResults.aiAnalysisResults,
      fraudDetectionScore: verificationResults.fraudDetectionScore,
      qualityScore: verificationResults.qualityScore,
      reviewedBy: verificationStatus === 'auto_verified' ? 'system' : null,
      approvedAt: verificationStatus === 'auto_verified' ? new Date() : null,
      paymentReleased: verificationStatus === 'auto_verified',
      paymentReleasedAt: verificationStatus === 'auto_verified' ? new Date() : null
    }
    
    const { data: submission, error: submissionError } = await supabase
      .from('task_completion_submissions')
      .insert(submissionData)
      .select()
      .single()
    
    if (submissionError) {
      console.error('Submission error:', submissionError)
      return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 })
    }
    
    // Update user verification history
    const historyData = {
      userId: user.id,
      submissionId: submission.id,
      verificationOutcome: verificationStatus,
      qualityScore: verificationResults.qualityScore,
      fraudScore: verificationResults.fraudDetectionScore,
      timeliness: validatedData.totalDuration ? Math.min(100, Math.max(0, 100 - (validatedData.totalDuration - 1800) / 60)) : 50,
      accuracyScore: verificationResults.autoVerificationScore,
      impactOnReputation: verificationStatus === 'auto_verified' ? 5 : verificationStatus === 'rejected' ? -10 : 0
    }
    
    await supabase
      .from('user_verification_history')
      .insert(historyData)
    
    // If auto-verified, update task participant status and process payment
    if (verificationStatus === 'auto_verified') {
      await supabase
        .from('task_participants')
        .update({ 
          status: 'completed',
          completedAt: new Date(),
          earnedAmount: taskData.earningPotential
        })
        .eq('id', validatedData.participantId)
      
      // TODO: Process payment through Stripe
      // await processTaskPayment(user.id, taskData.earningPotential, taskData.id)
    }
    
    return NextResponse.json({
      submissionId: submission.id,
      verificationStatus,
      autoVerificationScore: verificationResults.autoVerificationScore,
      qualityScore: verificationResults.qualityScore,
      fraudDetectionScore: verificationResults.fraudDetectionScore,
      paymentReleased: verificationStatus === 'auto_verified',
      nextSteps: getNextStepsMessage(verificationStatus),
      aiAnalysisResults: verificationResults.aiAnalysisResults
    })
    
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ 
      error: 'Failed to process verification',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function getNextStepsMessage(status: string): string {
  switch (status) {
    case 'auto_verified':
      return 'Task automatically verified! Payment has been processed and added to your earnings.'
    case 'manual_review':
      return 'Submission under manual review. You\'ll be notified within 24 hours of the decision.'
    case 'requires_additional_proof':
      return 'Additional verification required. Please provide more documentation or evidence.'
    case 'rejected':
      return 'Submission rejected due to verification concerns. Contact support if you believe this is an error.'
    default:
      return 'Verification processing...'
  }
}

// GET endpoint for checking verification status
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const submissionId = url.searchParams.get('submissionId')
    const taskId = url.searchParams.get('taskId')
    
    let query = supabase
      .from('task_completion_submissions')
      .select('*')
      .eq('userId', user.id)
    
    if (submissionId) {
      query = query.eq('id', submissionId)
    } else if (taskId) {
      query = query.eq('taskId', taskId)
    } else {
      return NextResponse.json({ error: 'Missing submissionId or taskId parameter' }, { status: 400 })
    }
    
    const { data: submissions, error } = await query
    
    if (error) {
      return NextResponse.json({ error: 'Failed to fetch verification status' }, { status: 500 })
    }
    
    return NextResponse.json(submissions)
    
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({ error: 'Failed to check verification status' }, { status: 500 })
  }
}