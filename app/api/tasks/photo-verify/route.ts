import { NextRequest, NextResponse } from 'next/server'

interface PhotoVerificationResult {
  isValid: boolean
  confidence: number
  detectedObjects: string[]
  reasoning: string
  requiresManualReview: boolean
}

// Mock AI photo verification - in production this would use Google Vision AI, AWS Rekognition, or similar
async function verifyTaskPhoto(taskId: string, photoUrl: string): Promise<PhotoVerificationResult> {
  // Task-specific verification logic
  const taskVerificationRules = {
    'platform-001': { // Laundry Day
      requiredObjects: ['clothing', 'laundry', 'folded clothes', 'clean clothes'],
      keywords: ['laundry', 'clean', 'folded', 'organized']
    },
    'platform-002': { // Kitchen Clean-Up
      requiredObjects: ['kitchen', 'clean dishes', 'counter', 'sink'],
      keywords: ['clean', 'kitchen', 'dishes', 'sparkling', 'organized']
    },
    'platform-003': { // Pilates Session
      requiredObjects: ['person exercising', 'yoga mat', 'pilates pose', 'workout'],
      keywords: ['pilates', 'exercise', 'workout', 'pose', 'mat']
    },
    'platform-004': { // Grocery Run
      requiredObjects: ['groceries', 'shopping bags', 'food items', 'receipt'],
      keywords: ['groceries', 'shopping', 'food', 'receipt', 'store']
    },
    'platform-005': { // Room Organization
      requiredObjects: ['organized room', 'clean space', 'tidy room'],
      keywords: ['organized', 'clean', 'tidy', 'room', 'before', 'after']
    }
  }

  const rules = taskVerificationRules[taskId as keyof typeof taskVerificationRules]
  
  if (!rules) {
    return {
      isValid: false,
      confidence: 0,
      detectedObjects: [],
      reasoning: 'Unknown task type',
      requiresManualReview: true
    }
  }

  // Simulate AI photo analysis
  // In production, this would call actual computer vision APIs
  const mockAnalysis = await simulatePhotoAnalysis(photoUrl, rules)
  
  return mockAnalysis
}

async function simulatePhotoAnalysis(photoUrl: string, rules: any): Promise<PhotoVerificationResult> {
  // Mock photo analysis - checks if photo URL contains relevant keywords
  const urlLower = photoUrl.toLowerCase()
  const descriptionLower = photoUrl.toLowerCase()
  
  let matchedObjects: string[] = []
  let confidence = 0
  
  // Enhanced keyword matching with scoring
  for (const keyword of rules.keywords) {
    if (descriptionLower.includes(keyword)) {
      matchedObjects.push(keyword)
      confidence += 0.2 // Increased weight for relevant keywords
    }
  }
  
  // Enhanced object detection
  for (const object of rules.requiredObjects) {
    if (descriptionLower.includes(object.toLowerCase())) {
      matchedObjects.push(object)
      confidence += 0.25 // Higher weight for required objects
    }
  }
  
  // Photo/description quality checks
  const hasValidFormat = photoUrl.includes('http') || photoUrl.includes('imgur') || photoUrl.includes('image') || descriptionLower.length > 15
  const hasDetailedDescription = descriptionLower.length > 30
  const hasMeasurableProgress = descriptionLower.includes('before') || descriptionLower.includes('after') || descriptionLower.includes('complete')
  
  if (hasValidFormat) confidence += 0.15
  if (hasDetailedDescription) confidence += 0.1
  if (hasMeasurableProgress) confidence += 0.15
  
  // Adjusted thresholds for better accuracy
  const isValid = confidence >= 0.7 && matchedObjects.length >= 2 // Higher threshold for auto-approval
  const requiresManualReview = confidence < 0.7 && confidence >= 0.4 // Manual review zone
  
  return {
    isValid,
    confidence: Math.min(confidence, 1.0),
    detectedObjects: matchedObjects,
    reasoning: isValid 
      ? `Detected relevant content: ${matchedObjects.join(', ')}. Confidence: ${Math.round(confidence * 100)}%`
      : `Insufficient evidence of task completion. Need more specific verification.`,
    requiresManualReview
  }
}

export async function POST(request: NextRequest) {
  try {
    const { taskId, photoUrl, description } = await request.json()

    if (!taskId || (!photoUrl && !description)) {
      return NextResponse.json(
        { error: 'Task ID and photo/description are required' },
        { status: 400 }
      )
    }

    // Combine photo URL and description for analysis
    const verificationText = `${photoUrl || ''} ${description || ''}`.trim()
    
    const verification = await verifyTaskPhoto(taskId, verificationText)

    return NextResponse.json({
      success: true,
      verification: {
        isValid: verification.isValid,
        confidence: verification.confidence,
        detectedObjects: verification.detectedObjects,
        reasoning: verification.reasoning,
        requiresManualReview: verification.requiresManualReview,
        autoApproved: verification.isValid && !verification.requiresManualReview
      }
    })

  } catch (error) {
    console.error('Error verifying photo:', error)
    return NextResponse.json(
      { error: 'Failed to verify photo' },
      { status: 500 }
    )
  }
}