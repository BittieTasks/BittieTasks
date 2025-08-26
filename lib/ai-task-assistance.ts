import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface TaskSuggestion {
  title: string
  description: string
  category: string
  estimatedDuration: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedPrice?: number
  tags: string[]
  requirements?: string[]
}

export interface TaskAnalysis {
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedDuration: string
  estimatedPrice?: number
  tags: string[]
  improvements: string[]
  riskFlags: string[]
}

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
export async function enhanceTaskDescription(title: string, description: string, type: 'community' | 'barter'): Promise<{
  enhancedDescription: string
  suggestions: string[]
}> {
  try {
    const prompt = type === 'community' 
      ? `You are helping someone create a neighborhood task posting for community help (paid task with 7% platform fee). 

Given this task:
Title: "${title}"
Description: "${description}"

Please provide:
1. An enhanced, clearer description (2-3 sentences max)
2. 3-5 helpful suggestions to make the task more appealing and clear

Focus on: clarity, safety, fair pricing expectations, and neighbor-friendly language.
Respond in JSON format: { "enhancedDescription": string, "suggestions": string[] }`
      : `You are helping someone create a barter trade posting (no fees, pure exchange).

Given this barter task:
Title: "${title}"
Description: "${description}"

Please provide:
1. An enhanced, clearer description (2-3 sentences max)
2. 3-5 helpful suggestions to make the trade more appealing and fair

Focus on: clear value exchange, fairness, safety, and community-friendly language.
Respond in JSON format: { "enhancedDescription": string, "suggestions": string[] }`

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7
    })

    return JSON.parse(response.choices[0].message.content || '{}')
  } catch (error) {
    console.error('AI enhancement error:', error)
    return {
      enhancedDescription: description,
      suggestions: []
    }
  }
}

export async function analyzeTaskContent(taskData: {
  title: string
  description: string
  type: 'community' | 'barter'
  offering?: string
  seeking?: string
}): Promise<TaskAnalysis> {
  try {
    const prompt = `Analyze this neighborhood task for categorization and optimization:

Title: "${taskData.title}"
Description: "${taskData.description}"
Type: ${taskData.type}
${taskData.offering ? `Offering: "${taskData.offering}"` : ''}
${taskData.seeking ? `Seeking: "${taskData.seeking}"` : ''}

Please analyze and provide:
1. Best category: cleaning, shopping, delivery, yard-work, tech-help, pet-care, tutoring, moving, repairs, cooking, trade, other
2. Difficulty: easy, medium, hard
3. Estimated duration (e.g., "30 minutes", "2 hours", "Half day")
4. ${taskData.type === 'community' ? 'Fair price estimate (USD)' : 'Skip pricing (barter task)'}
5. Relevant tags (3-5 words)
6. Improvement suggestions (3-5 tips)
7. Risk/safety flags if any

Respond in JSON: {
  "category": string,
  "difficulty": "easy" | "medium" | "hard",
  "estimatedDuration": string,
  ${taskData.type === 'community' ? '"estimatedPrice": number,' : ''}
  "tags": string[],
  "improvements": string[],
  "riskFlags": string[]
}`

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3
    })

    return JSON.parse(response.choices[0].message.content || '{}')
  } catch (error) {
    console.error('AI analysis error:', error)
    return {
      category: 'other',
      difficulty: 'medium',
      estimatedDuration: '1 hour',
      tags: [],
      improvements: [],
      riskFlags: []
    }
  }
}

export async function generateTaskSuggestions(userInput: string, type: 'community' | 'barter'): Promise<TaskSuggestion[]> {
  try {
    const prompt = type === 'community' 
      ? `Generate 3 relevant paid neighborhood task suggestions based on this input: "${userInput}"

Focus on tasks that neighbors commonly help each other with for fair payment (7% platform fee).
Each task should be:
- Realistic and doable by neighbors
- Clearly beneficial 
- Fairly priced for the local market
- Safe and appropriate

Respond in JSON: {
  "suggestions": [
    {
      "title": string,
      "description": string,
      "category": string,
      "estimatedDuration": string,
      "difficulty": "easy" | "medium" | "hard",
      "estimatedPrice": number,
      "tags": string[],
      "requirements": string[]
    }
  ]
}`
      : `Generate 3 relevant barter trade suggestions based on this input: "${userInput}"

Focus on fair exchanges that create mutual value between neighbors (no fees).
Each trade should be:
- Balanced in value/effort
- Useful to both parties
- Safe and appropriate
- Clear about what's offered vs. wanted

Respond in JSON: {
  "suggestions": [
    {
      "title": string,
      "description": string,
      "category": string,
      "estimatedDuration": string,
      "difficulty": "easy" | "medium" | "hard",
      "tags": string[],
      "requirements": string[]
    }
  ]
}`

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.8
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return result.suggestions || []
  } catch (error) {
    console.error('AI suggestions error:', error)
    return []
  }
}

export async function detectInappropriateContent(content: string): Promise<{
  isAppropriate: boolean
  flags: string[]
  severity: 'low' | 'medium' | 'high'
}> {
  try {
    const prompt = `Analyze this neighborhood task content for safety and appropriateness:

"${content}"

Check for:
- Potentially unsafe activities
- Inappropriate requests
- Unclear or suspicious language
- Activities requiring professional licenses
- Child safety concerns

Respond in JSON: {
  "isAppropriate": boolean,
  "flags": string[],
  "severity": "low" | "medium" | "high"
}`

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2
    })

    return JSON.parse(response.choices[0].message.content || '{}')
  } catch (error) {
    console.error('Content detection error:', error)
    return {
      isAppropriate: true,
      flags: [],
      severity: 'low'
    }
  }
}