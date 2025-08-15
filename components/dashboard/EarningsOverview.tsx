'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { DollarSign, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight, PieChart } from 'lucide-react'
import { formatCurrency, getFeeDisplayInfo } from '@/lib/fee-calculator'
import type { TaskType } from '@/lib/fee-calculator'

interface EarningsData {
  totalEarnings: number
  thisMonth: number
  lastMonth: number
  pendingPayments: number
  completedTasks: number
  monthlyGoal: number
  taskBreakdown: {
    solo: { count: number; earnings: number }
    community: { count: number; earnings: number }
    barter: { count: number; earnings: number }
    corporate: { count: number; earnings: number }
  }
  recentPayments: Array<{
    id: string
    taskTitle: string
    taskType: TaskType
    grossAmount: number
    platformFee: number
    netAmount: number
    completedAt: string
  }>
}

interface EarningsOverviewProps {
  data: EarningsData
  className?: string
}

export function EarningsOverview({ data, className = '' }: EarningsOverviewProps) {
  const monthlyProgress = Math.min((data.thisMonth / data.monthlyGoal) * 100, 100)
  const monthChange = data.thisMonth - data.lastMonth
  const monthChangePercent = data.lastMonth > 0 ? (monthChange / data.lastMonth) * 100 : 0

  const getTaskTypeIcon = (type: TaskType) => {
    const colors = {
      solo: 'bg-blue-100 text-blue-800',
      community: 'bg-green-100 text-green-800', 
      barter: 'bg-purple-100 text-purple-800',
      corporate: 'bg-orange-100 text-orange-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-600">Total Earnings</span>
            </div>
            <p className="text-2xl font-bold text-green-700">
              {formatCurrency(data.totalEarnings)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-gray-600">This Month</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(data.thisMonth)}
            </p>
            <div className="flex items-center gap-1 mt-1">
              {monthChangePercent > 0 ? (
                <ArrowUpRight className="w-3 h-3 text-green-600" />
              ) : monthChangePercent < 0 ? (
                <ArrowDownRight className="w-3 h-3 text-red-600" />
              ) : null}
              <span className={`text-xs ${
                monthChangePercent > 0 ? 'text-green-600' :
                monthChangePercent < 0 ? 'text-red-600' : 'text-gray-500'
              }`}>
                {monthChangePercent > 0 ? '+' : ''}{monthChangePercent.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {formatCurrency(data.pendingPayments)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-600">Tasks Done</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {data.completedTasks}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Goal Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Monthly Goal Progress</span>
            <Badge variant="outline">
              {monthlyProgress.toFixed(1)}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress: {formatCurrency(data.thisMonth)}</span>
              <span>Goal: {formatCurrency(data.monthlyGoal)}</span>
            </div>
            <Progress value={monthlyProgress} className="h-2" />
          </div>
          {data.pendingPayments > 0 && (
            <p className="text-sm text-gray-600">
              + {formatCurrency(data.pendingPayments)} pending will boost your progress!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Task Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings by Task Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(data.taskBreakdown).map(([type, stats]) => {
              const feeInfo = getFeeDisplayInfo(type as TaskType)
              return (
                <div key={type} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={`capitalize ${getTaskTypeIcon(type as TaskType)}`}>
                      {type}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {feeInfo.displayPercentage} fee
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-semibold">
                      {formatCurrency(stats.earnings)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {stats.count} {stats.count === 1 ? 'task' : 'tasks'}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {feeInfo.description}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentPayments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No payments yet</p>
                <p className="text-sm">Complete tasks to start earning!</p>
              </div>
            ) : (
              data.recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium">{payment.taskTitle}</p>
                      <Badge className={`capitalize ${getTaskTypeIcon(payment.taskType)}`}>
                        {payment.taskType}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{payment.completedAt}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-700">
                      {formatCurrency(payment.netAmount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Gross: {formatCurrency(payment.grossAmount)}
                    </p>
                    {payment.platformFee > 0 && (
                      <p className="text-xs text-red-600">
                        Fee: -{formatCurrency(payment.platformFee)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fee Transparency Note */}
      <Card className="bg-teal-50 border-teal-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-teal-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-teal-800 mb-1">Radical Transparency</h4>
              <p className="text-sm text-teal-700 leading-relaxed">
                All fees are clearly disclosed upfront. Platform fees support community coordination, 
                verification systems, and secure payments. Barter exchanges are completely free to 
                encourage local trading and community connections.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EarningsOverview