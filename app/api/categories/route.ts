import { NextResponse } from 'next/server'
import { createServerClient } from '../../../lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, description, icon, color')
      .order('name', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ categories })
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}