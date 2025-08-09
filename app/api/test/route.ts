import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ 
    message: "Next.js API working",
    timestamp: new Date().toISOString()
  })
}