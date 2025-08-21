'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/app/hooks/use-toast'
import { TaskPaymentModal } from './TaskPaymentModal'
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  Target,
  Shield,
  Award,
  RefreshCw
} from 'lucide-react'

interface EarningsData {
  summary: {
    totalEarnings: number
    monthlyEarnings: number
    weeklyEarnings: number
    tasksCompleted: number
    verificationLevel: string
  }
  transactions: Array<{
    id: string
    type: string
    amount: string
    description: string
    status: string
    createdAt: string
    tasks?: {
      id: string
      title: string
      type: string
      category: string
    }
  }>
  submissions: Array<{
    id: string
    verificationStatus: string
    autoVerificationScore: number
    fraudDetectionScore: number
    qualityScore: number
    paymentReleased: boolean
    createdAt: string
    tasks: {
      id: string
      title: string
      type: string
      earningPotential: string
    }
  }>
  verificationStats: {
    autoVerified: number
    manualReview: number
    rejected: number
    pending: number
    averageQuality: number
    averageFraudRisk: number
  }
  earningsByType: {
    platform_funded: number
    peer_to_peer: number
    corporate_sponsored: number
  }
  pendingPayments: Array<{
    submissionId: string
    taskTitle: string
    amount: string
    taskType: string
    createdAt: string
  }>
}

export function EarningsDashboard() {
  const [data, setData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean
    task?: any
    submission?: any
  }>({ isOpen: false })
  const { toast } = useToast()

  const fetchEarnings = async (period = 'month') => {
    try {
      setLoading(true)
      const response = await fetch(`/api/earnings?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch earnings data')
      }

      const earningsData = await response.json()
      setData(earningsData)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEarnings(selectedPeriod)
  }, [selectedPeriod])

  const handleClaimPayment = (submission: any) => {
    const task = {
      id: submission.tasks.id,
      title: submission.tasks.title,
      earningPotential: submission.tasks.earningPotential,
      type: submission.tasks.type
    }

    setPaymentModal({
      isOpen: true,
      task,
      submission
    })
  }

  const getVerificationBadge = (status: string) => {
    const config = {
      auto_verified: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200', icon: CheckCircle },
      manual_review: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200', icon: Clock },
      rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200', icon: XCircle },
      pending: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200', icon: Clock }
    }

    const { color, icon: Icon } = config[status as keyof typeof config] || config.pending
    
    return (
      <Badge className={`${color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
      </Badge>
    )
  }

  const getTaskTypeBadge = (type: string) => {
    const colors = {
      platform_funded: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
      peer_to_peer: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
      corporate_sponsored: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200'
    }
    
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading earnings data...</span>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load earnings data</p>
        <Button onClick={() => fetchEarnings(selectedPeriod)} className="mt-2">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${data.summary.totalEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              All-time earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.summary.monthlyEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.tasksCompleted}
            </div>
            <p className="text-xs text-muted-foreground">
              Total tasks completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verification Level</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {data.summary.verificationLevel}
            </div>
            <p className="text-xs text-muted-foreground">
              Account status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments */}
      {data.pendingPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Pending Payments
            </CardTitle>
            <CardDescription>
              Auto-verified tasks ready for payment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.pendingPayments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div>
                    <p className="font-medium">{payment.taskTitle}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getTaskTypeBadge(payment.taskType)}
                      <span className="text-sm text-gray-600">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-green-600">
                      ${payment.amount}
                    </span>
                    <Button 
                      size="sm"
                      onClick={() => {
                        const submission = data.submissions.find(s => s.id === payment.submissionId)
                        if (submission) handleClaimPayment(submission)
                      }}
                    >
                      Claim Payment
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed View */}
      <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
        <TabsList>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="all">All Time</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPeriod} className="space-y-4">
          {/* Verification Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Performance</CardTitle>
              <CardDescription>
                Your submission quality and verification success rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {data.verificationStats.autoVerified}
                  </div>
                  <p className="text-sm text-gray-600">Auto-Verified</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {data.verificationStats.manualReview}
                  </div>
                  <p className="text-sm text-gray-600">Manual Review</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {data.verificationStats.rejected}
                  </div>
                  <p className="text-sm text-gray-600">Rejected</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {data.verificationStats.pending}
                  </div>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Average Quality Score</span>
                    <span>{data.verificationStats.averageQuality}/100</span>
                  </div>
                  <Progress value={data.verificationStats.averageQuality} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Fraud Risk Level</span>
                    <span>{data.verificationStats.averageFraudRisk}/100</span>
                  </div>
                  <Progress 
                    value={100 - data.verificationStats.averageFraudRisk} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest earnings and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                        {transaction.tasks && getTaskTypeBadge(transaction.tasks.type)}
                        <span className="text-sm text-gray-600">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${
                        transaction.type === 'task_earning' 
                          ? 'text-green-600' 
                          : transaction.type === 'task_payment'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}>
                        {transaction.type === 'task_earning' ? '+' : transaction.type === 'task_payment' ? '-' : ''}
                        ${parseFloat(transaction.amount).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {data.transactions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No transactions found for this period
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Modal */}
      {paymentModal.isOpen && paymentModal.task && paymentModal.submission && (
        <TaskPaymentModal
          isOpen={paymentModal.isOpen}
          onClose={() => {
            setPaymentModal({ isOpen: false })
            fetchEarnings(selectedPeriod) // Refresh data after payment
          }}
          task={paymentModal.task}
          submission={paymentModal.submission}
        />
      )}
    </div>
  )
}