import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { db } from '../../../../server/db'
import { tasks, taskParticipants } from '@shared/schema'
import { eq, desc } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Supabase
    const supabase = createServerClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('GET /api/tasks/applications auth error:', authError?.message)
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    let allApplications: any[] = []

    // Check if database is available and fetch regular task applications
    if (process.env.DATABASE_URL) {
      try {
        const userApplications = await db
          .select({
            id: tasks.id,
            title: tasks.title,
            status: taskParticipants.status,
            payout: tasks.earningPotential,
            location: tasks.location,
            applied_at: taskParticipants.joinedAt,
            task_type: tasks.type,
            deadline: taskParticipants.deadline,
            deadline_extended: taskParticipants.deadlineExtended,
          })
          .from(taskParticipants)
          .innerJoin(tasks, eq(taskParticipants.taskId, tasks.id))
          .where(eq(taskParticipants.userId, user.id))
          .orderBy(desc(taskParticipants.joinedAt))
        
        // Transform regular tasks
        allApplications = userApplications.map((app: any) => ({
          id: app.id,
          title: app.title,
          status: app.status as 'applied' | 'accepted' | 'completed' | 'verified' | 'joined' | 'expired',
          payout: Number(app.payout || 0),
          location: app.location || 'Location TBD',
          applied_at: app.applied_at?.toISOString() || new Date().toISOString(),
          task_type: app.task_type as 'shared' | 'solo' | 'sponsored',
          deadline: app.deadline?.toISOString() || null,
          deadline_extended: app.deadline_extended || false,
        }))
      } catch (error) {
        console.error('Error fetching regular task applications:', error)
      }
    }

    // Fetch solo task applications from Supabase
    try {
      const { data: soloApplications, error: soloError } = await supabase
        .from('task_participants')
        .select('*')
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false })

      if (!soloError && soloApplications) {
        // Import solo tasks data
        const { everydayTasks } = await import('@/lib/everydayTasks')
        
        // Transform solo task applications
        const soloTasksFormatted = soloApplications
          .map((app: any) => {
            const task = everydayTasks.find(t => t.id === app.task_id)
            if (!task) return null
            
            return {
              id: app.task_id,
              title: task.title,
              status: app.status as 'applied' | 'accepted' | 'completed' | 'verified' | 'joined' | 'expired',
              payout: task.payout,
              location: task.location_type === 'home' ? 'Your Home' : 'Local Area',
              applied_at: app.joined_at || new Date().toISOString(),
              task_type: 'solo' as const,
              deadline: app.deadline || null,
              deadline_extended: false,
            }
          })
          .filter(Boolean)

        allApplications = [...allApplications, ...soloTasksFormatted]
      }
    } catch (error) {
      console.error('Error fetching solo task applications:', error)
    }

    // Sort all applications by applied_at date (newest first)
    const formattedApplications = allApplications.sort((a, b) => 
      new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime()
    )
    
    return NextResponse.json(formattedApplications)
  } catch (error) {
    console.error('Error fetching task applications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch task applications' },
      { status: 500 }
    )
  }
}