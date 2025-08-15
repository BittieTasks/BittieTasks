// Phase 3B: AI Verification System for Task Completion
import OpenAI from 'openai'

// Initialize OpenAI client
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required')
  }
  return new OpenAI({ apiKey })
}

export interface VerificationPrompt {
  taskType: 'cleaning' | 'lawn_care' | 'organization' | 'maintenance' | 'delivery' | 'other'
  taskDescription: string
  beforePhoto?: string // Base64 encoded image
  afterPhoto: string // Base64 encoded image (required)
  location?: string
  additionalInstructions?: string
}

export interface VerificationResult {
  verified: boolean
  confidence: number // 0-100
  reasoning: string
  suggestions?: string[]
  requiresManualReview: boolean
  details: {
    taskCompleted: boolean
    qualityScore: number // 0-100
    issuesFound: string[]
    positiveAspects: string[]
  }
}

export async function verifyTaskCompletion(verification: VerificationPrompt): Promise<VerificationResult> {
  const openai = getOpenAIClient()

  // Create verification prompt based on task type
  const systemPrompt = createSystemPrompt(verification.taskType)
  const userPrompt = createUserPrompt(verification)

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Latest multimodal model for image analysis
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt
            },
            ...(verification.beforePhoto ? [{
              type: "image_url" as const,
              image_url: {
                url: `data:image/jpeg;base64,${verification.beforePhoto}`
              }
            }] : []),
            {
              type: "image_url" as const,
              image_url: {
                url: `data:image/jpeg;base64,${verification.afterPhoto}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    
    return {
      verified: result.verified || false,
      confidence: Math.min(100, Math.max(0, result.confidence || 0)),
      reasoning: result.reasoning || 'Unable to analyze task completion',
      suggestions: result.suggestions || [],
      requiresManualReview: result.requiresManualReview || result.confidence < 70,
      details: {
        taskCompleted: result.taskCompleted || false,
        qualityScore: Math.min(100, Math.max(0, result.qualityScore || 0)),
        issuesFound: result.issuesFound || [],
        positiveAspects: result.positiveAspects || []
      }
    }
  } catch (error: any) {
    console.error('AI verification error:', error)
    
    // Return manual review required for any API errors
    return {
      verified: false,
      confidence: 0,
      reasoning: 'AI verification temporarily unavailable - requires manual review',
      requiresManualReview: true,
      details: {
        taskCompleted: false,
        qualityScore: 0,
        issuesFound: ['AI verification service error'],
        positiveAspects: []
      }
    }
  }
}

function createSystemPrompt(taskType: string): string {
  const basePrompt = `You are an expert task verification AI for BittieTasks, a community marketplace. Your job is to analyze before/after photos to verify task completion with high accuracy and fairness.

RESPONSE FORMAT: Return valid JSON with this exact structure:
{
  "verified": boolean,
  "confidence": number (0-100),
  "reasoning": "detailed explanation",
  "suggestions": ["improvement suggestions if any"],
  "taskCompleted": boolean,
  "qualityScore": number (0-100),
  "issuesFound": ["specific issues"],
  "positiveAspects": ["what was done well"],
  "requiresManualReview": boolean
}

VERIFICATION STANDARDS:
- verified: true only if task is clearly completed to reasonable standards
- confidence: your certainty level (70+ for auto-approval, <70 triggers manual review)
- qualityScore: overall execution quality (60+ acceptable, 80+ excellent)
- requiresManualReview: true if confidence <70 or complex issues detected

GENERAL PRINCIPLES:
- Be fair but thorough - workers deserve credit for good work
- Focus on task completion, not perfection
- Consider reasonable effort and improvement
- Flag obvious incomplete work or safety issues
- Account for lighting, angle, and photo quality differences`

  const taskSpecificPrompts = {
    cleaning: `
CLEANING TASK VERIFICATION:
- Look for visible cleanliness improvement
- Check surfaces are cleared, wiped, organized
- Assess tidiness and order restoration
- Note any missed areas or incomplete work
- Consider before/after difference significance`,

    lawn_care: `
LAWN CARE VERIFICATION:
- Verify grass is cut to appropriate length
- Check for even cutting patterns
- Look for trimmed edges and cleaned areas
- Assess debris removal and cleanup
- Note any missed patches or uneven areas`,

    organization: `
ORGANIZATION TASK VERIFICATION:
- Confirm items are properly sorted and arranged
- Check for logical grouping and accessibility
- Assess space efficiency and tidiness
- Look for labeling or systematic arrangement
- Evaluate overall improvement in organization`,

    maintenance: `
MAINTENANCE TASK VERIFICATION:
- Verify the specific repair or maintenance was completed
- Check for proper execution and safety
- Look for cleaned work area and proper disposal
- Assess if the issue appears resolved
- Note any incomplete or concerning work`,

    delivery: `
DELIVERY VERIFICATION:
- Confirm items reached correct location
- Check for proper placement and condition
- Verify all items from description are present
- Look for careful handling and presentation
- Assess delivery completeness and accuracy`,

    other: `
GENERAL TASK VERIFICATION:
- Analyze task completion based on description provided
- Look for clear before/after improvement
- Assess effort and attention to detail
- Check for thoroughness and quality
- Evaluate if reasonable expectations were met`
  }

  return basePrompt + (taskSpecificPrompts[taskType as keyof typeof taskSpecificPrompts] || taskSpecificPrompts.other)
}

function createUserPrompt(verification: VerificationPrompt): string {
  let prompt = `TASK VERIFICATION REQUEST:

Task Type: ${verification.taskType}
Task Description: "${verification.taskDescription}"
${verification.location ? `Location: ${verification.location}` : ''}
${verification.additionalInstructions ? `Special Instructions: ${verification.additionalInstructions}` : ''}

Please analyze the ${verification.beforePhoto ? 'before and after photos' : 'completion photo'} to verify this task was completed satisfactorily.

${verification.beforePhoto ? 'The first image shows the "before" state, and the second image shows the "after" state.' : 'The image shows the completed task state.'}

Provide a thorough analysis considering:
1. Was the task completed as described?
2. What is the quality of the work?
3. Are there any issues or concerns?
4. What was done particularly well?
5. Overall confidence in task completion

Remember: Be fair to workers while maintaining quality standards. Focus on reasonable completion rather than perfection.`

  return prompt
}

// Verification confidence thresholds
export const VERIFICATION_THRESHOLDS = {
  AUTO_APPROVE: 70, // Confidence level for automatic approval
  MANUAL_REVIEW: 70, // Below this requires manual review
  QUALITY_MINIMUM: 60, // Minimum quality score for approval
  EXCELLENCE: 80 // Score for excellent work recognition
}

// Task type mapping for better AI prompts
export const TASK_TYPE_MAPPING = {
  'household': 'cleaning',
  'self-care': 'other',
  'lawn-care': 'lawn_care',
  'organization': 'organization',
  'maintenance': 'maintenance',
  'delivery': 'delivery',
  'cleaning': 'cleaning'
} as const