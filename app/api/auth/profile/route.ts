import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../../../lib/supabase'
import { db } from '../../../../server/db'
import { users } from '../../../../shared/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user data from request
    const userData = await request.json()
    
    // Check if user already exists in our database
    const existingUser = await db.select().from(users).where(eq(users.id, user.id)).limit(1)
    
    if (existingUser.length > 0) {
      // Update existing user
      const updatedUser = await db
        .update(users)
        .set({
          email: userData.email || user.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          verified: user.email_confirmed_at != null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id))
        .returning()
      
      return NextResponse.json({ user: updatedUser[0] })
    } else {
      // Create new user
      const newUser = await db
        .insert(users)
        .values({
          id: user.id,
          email: userData.email || user.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          verified: user.email_confirmed_at != null,
          subscriptionTier: 'free',
          subscriptionStatus: 'active',
          monthlyTaskLimit: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning()
      
      return NextResponse.json({ user: newUser[0] })
    }
  } catch (error) {
    console.error('Error managing user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get user from our database
    const dbUser = await db.select().from(users).where(eq(users.id, user.id)).limit(1)
    
    if (dbUser.length === 0) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    return NextResponse.json({ user: dbUser[0] })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}