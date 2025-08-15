import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Info, DollarSign, ArrowRight } from 'lucide-react'
import { calculateFees, getFeeDisplayInfo, type TaskType } from '@/lib/fee-calculator'

interface FeeBreakdownProps {
  amount: number
  taskType: TaskType
  className?: string
  variant?: 'default' | 'compact' | 'detailed'
}

export function FeeBreakdown({ 
  amount, 
  taskType, 
  className = '',
  variant = 'default'
}: FeeBreakdownProps) {
  const feeCalculation = calculateFees(amount, taskType)
  const feeInfo = getFeeDisplayInfo(taskType)

  if (variant === 'compact') {
    return (
      <div className={`bg-gray-50 rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">You'll receive:</span>
          <span className="font-semibold text-green-700">
            {feeCalculation.breakdown.net}
          </span>
        </div>
        {feeCalculation.platformFee > 0 && (
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>Platform fee ({feeInfo.displayPercentage}):</span>
            <span>-{feeCalculation.breakdown.platformFee}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-teal-600" />
            Fee Breakdown
          </CardTitle>
          <Badge variant={taskType === 'barter' ? 'default' : 'secondary'}>
            {feeInfo.displayPercentage} Fee
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Task Type Info */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-teal-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-teal-800 capitalize">
                {taskType} Task
              </p>
              <p className="text-xs text-teal-700">
                {feeInfo.description}
              </p>
            </div>
          </div>
        </div>

        {/* Fee Calculation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Task Amount</span>
            <span className="font-semibold">
              {feeCalculation.breakdown.gross}
            </span>
          </div>

          {/* Platform Fee */}
          {feeCalculation.platformFee > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Platform Fee</span>
                <span className="text-xs text-gray-400">
                  ({feeInfo.displayPercentage})
                </span>
              </div>
              <span className="text-red-600">
                -{feeCalculation.breakdown.platformFee}
              </span>
            </div>
          )}

          {/* Processing Fee */}
          {feeCalculation.processingFee > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Processing Fee</span>
              <span className="text-red-600">
                -{feeCalculation.breakdown.processingFee}
              </span>
            </div>
          )}

          {/* Barter Special Case */}
          {taskType === 'barter' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  No fees! Direct value trading
                </span>
              </div>
            </div>
          )}

          <Separator />

          {/* Net Amount */}
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-800">
              You'll Receive
            </span>
            <span className="text-xl font-bold text-green-700">
              {feeCalculation.breakdown.net}
            </span>
          </div>
        </div>

        {/* Transparency Note */}
        {variant === 'detailed' && (
          <div className="pt-3 border-t">
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong>Radical Transparency:</strong> All fees are clearly disclosed upfront. 
              Platform fees support community coordination, verification systems, and secure payments. 
              {taskType === 'barter' && ' Barter exchanges are completely free to encourage local trading.'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default FeeBreakdown