import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '../../../lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'all' // all, month, week
    const limit = parseInt(url.searchParams.get('limit') || '50')

    // Get user's total earnings and stats
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('totalEarnings, tasksCompleted, verificationLevel')
      .eq('id', user.id)
      .single()

    if (userError) {
      return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
    }

    // Get recent transactions
    let transactionQuery = supabase
      .from('transactions')
      .select(`
        id,
        type,
        amount,
        description,
        status,
        createdAt,
        processedAt,
        metadata,
        tasks:taskId (
          id,
          title,
          type,
          category
        )
      `)
      .eq('userId', user.id)
      .order('createdAt', { ascending: false })
      .limit(limit)

    // Filter by period if specified
    if (period === 'month') {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      transactionQuery = transactionQuery.gte('createdAt', monthAgo.toISOString())
    } else if (period === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      transactionQuery = transactionQuery.gte('createdAt', weekAgo.toISOString())
    }

    const { data: transactions, error: transactionError } = await transactionQuery

    if (transactionError) {
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }

    // Get task completion submissions for verification stats
    const { data: submissions, error: submissionError } = await supabase
      .from('task_completion_submissions')
      .select(`
        id,
        verificationStatus,
        autoVerificationScore,
        fraudDetectionScore,
        qualityScore,
        paymentReleased,
        createdAt,
        tasks:taskId (
          id,
          title,
          type,
          earningPotential
        )
      `)
      .eq('userId', user.id)
      .order('createdAt', { ascending: false })
      .limit(20)

    if (submissionError) {
      console.error('Submission fetch error:', submissionError)
    }

    // Calculate earnings by period
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisWeek = new Date(now.setDate(now.getDate() - now.getDay()))

    const monthlyEarnings = transactions
      ?.filter(t => 
        t.status === 'completed' && 
        t.type === 'task_earning' &&
        new Date(t.createdAt) >= thisMonth
      )
      .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0

    const weeklyEarnings = transactions
      ?.filter(t => 
        t.status === 'completed' && 
        t.type === 'task_earning' &&
        new Date(t.createdAt) >= thisWeek
      )
      .reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0

    // Calculate verification stats
    const verificationStats = {
      autoVerified: submissions?.filter(s => s.verificationStatus === 'auto_verified').length || 0,
      manualReview: submissions?.filter(s => s.verificationStatus === 'manual_review').length || 0,
      rejected: submissions?.filter(s => s.verificationStatus === 'rejected').length || 0,
      pending: submissions?.filter(s => s.verificationStatus === 'pending').length || 0,
      averageQuality: submissions?.length ? 
        Math.round(submissions.reduce((sum, s) => sum + (s.qualityScore || 0), 0) / submissions.length) : 0,
      averageFraudRisk: submissions?.length ?
        Math.round(submissions.reduce((sum, s) => sum + (s.fraudDetectionScore || 0), 0) / submissions.length) : 0
    }

    // Calculate earnings by task type
    const earningsByType = {
      platform_funded: 0,
      peer_to_peer: 0,
      corporate_sponsored: 0
    }

    transactions?.forEach(t => {
      if (t.status === 'completed' && t.type === 'task_earning' && t.tasks) {
        // Handle both single task object and array
        const task = Array.isArray(t.tasks) ? t.tasks[0] : t.tasks
        if (task && task.type) {
          const taskType = task.type as keyof typeof earningsByType
          if (taskType in earningsByType) {
            earningsByType[taskType] += parseFloat(t.amount)
          }
        }
      }
    })

    // Get pending payments
    const pendingPayments = submissions
      ?.filter(s => 
        s.verificationStatus === 'auto_verified' && 
        !s.paymentReleased
      )
      .map(s => {
        const task = Array.isArray(s.tasks) ? s.tasks[0] : s.tasks
        return {
          submissionId: s.id,
          taskTitle: task?.title || 'Unknown Task',
          amount: task?.earningPotential || '0',
          taskType: task?.type || 'unknown',
          createdAt: s.createdAt
        }
      }) || []

    return NextResponse.json({
      summary: {
        totalEarnings: parseFloat(userData.totalEarnings || '0'),
        monthlyEarnings,
        weeklyEarnings,
        tasksCompleted: userData.tasksCompleted || 0,
        verificationLevel: userData.verificationLevel || 'unverified'
      },
      transactions: transactions || [],
      submissions: submissions || [],
      verificationStats,
      earningsByType,
      pendingPayments
    })

  } catch (error: any) {
    console.error('Earnings API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch earnings data',
      details: error.message
    }, { status: 500 })
  }
}