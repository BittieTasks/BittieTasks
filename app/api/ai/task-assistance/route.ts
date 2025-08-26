import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { enhanceTaskDescription, analyzeTaskContent, generateTaskSuggestions, detectInappropriateContent } from '@/lib/ai-task-assistance'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookieStore = await cookies()
    const phoneAuth = cookieStore.get('phone_auth')
    const userInfo = cookieStore.get('user_info')

    if (!phoneAuth || !userInfo) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'enhance_description':
        const enhanced = await enhanceTaskDescription(
          data.title, 
          data.description, 
          data.type
        )
        return NextResponse.json(enhanced)

      case 'analyze_task':
        const analysis = await analyzeTaskContent(data)
        return NextResponse.json(analysis)

      case 'generate_suggestions':
        const suggestions = await generateTaskSuggestions(
          data.userInput, 
          data.type
        )
        return NextResponse.json({ suggestions })

      case 'check_content':
        const contentCheck = await detectInappropriateContent(data.content)
        return NextResponse.json(contentCheck)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('AI assistance error:', error)
    return NextResponse.json(
      { error: 'AI assistance failed' }, 
      { status: 500 }
    )
  }
}