import { NextResponse } from 'next/server'

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Check system health
    const memUsage = process.memoryUsage()
    const uptime = process.uptime()
    
    // Check database connectivity (if needed)
    let dbStatus = 'healthy'
    try {
      // You could add a simple DB query here
      // const { data } = await supabase.from('users').select('count').single()
    } catch (error) {
      dbStatus = 'error'
    }

    const responseTime = Date.now() - startTime

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      responseTime: `${responseTime}ms`,
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
        external: Math.round(memUsage.external / 1024 / 1024) + 'MB'
      },
      database: dbStatus,
      node_version: process.version,
      env: process.env.NODE_ENV
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}