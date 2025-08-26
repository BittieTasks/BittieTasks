import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const phoneAuth = cookieStore.get('phone_auth')
    const userInfo = cookieStore.get('user_info')

    if (!phoneAuth || !userInfo) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const user = JSON.parse(userInfo.value)
    
    return NextResponse.json({
      authenticated: true,
      user: {
        phone: phoneAuth.value,
        firstName: user.firstName,
        lastName: user.lastName
      }
    })

  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}