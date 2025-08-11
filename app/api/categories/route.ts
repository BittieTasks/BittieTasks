import { NextResponse } from 'next/server'
import { createServerClient } from '../../../lib/supabase'

export async function GET() {
  try {
    const supabase = createServerClient()
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, description, icon, color')
      .order('name', { ascending: true })

    if (error || !categories || categories.length === 0) {
      console.log('Database empty or error, returning sample categories:', error)
      // Return sample categories if database is empty
      const sampleCategories = [
        { id: 1, name: 'School & Education', color: 'bg-blue-100 text-blue-700', icon: 'GraduationCap', description: 'School pickups, tutoring, educational activities' },
        { id: 2, name: 'Meal Planning', color: 'bg-green-100 text-green-700', icon: 'ChefHat', description: 'Meal prep, cooking together, grocery planning' },
        { id: 3, name: 'Shopping & Errands', color: 'bg-purple-100 text-purple-700', icon: 'ShoppingBag', description: 'Grocery runs, errands, bulk buying groups' },
        { id: 4, name: 'Transportation', color: 'bg-orange-100 text-orange-700', icon: 'Car', description: 'Carpooling, ride sharing, transportation help' },
        { id: 5, name: 'Childcare Support', color: 'bg-pink-100 text-pink-700', icon: 'Heart', description: 'Babysitting, playdate exchanges, child supervision' },
        { id: 6, name: 'Home & Garden', color: 'bg-emerald-100 text-emerald-700', icon: 'Home', description: 'Home maintenance, gardening, cleaning help' },
        { id: 7, name: 'Health & Wellness', color: 'bg-teal-100 text-teal-700', icon: 'Activity', description: 'Fitness groups, wellness activities, health support' },
        { id: 8, name: 'Social Events', color: 'bg-indigo-100 text-indigo-700', icon: 'Users', description: 'Community events, parties, social gatherings' }
      ]
      return NextResponse.json({ categories: sampleCategories })
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