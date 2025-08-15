import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MapPin, Clock, DollarSign, Users, ArrowRight } from 'lucide-react'
import { FeeBreakdown } from '@/components/payment/FeeBreakdown'
import PaymentModal from '@/components/payment/PaymentModal'
import { formatCurrency, calculateFees, getFeeDisplayInfo } from '@/lib/fee-calculator'
import type { TaskType } from '@/lib/fee-calculator'

interface EnhancedTaskCardProps {
  id: string
  title: string
  description: string
  amount: number
  taskType: TaskType
  location: string
  timeEstimate?: string
  postedBy: string
  postedAt: string
  applicants?: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  onApply?: (taskId: string) => void
  showPayment?: boolean
  currentUserId?: string
  className?: string
}

export function EnhancedTaskCard({
  id,
  title,
  description,
  amount,
  taskType,
  location,
  timeEstimate,
  postedBy,
  postedAt,
  applicants = 0,
  difficulty,
  onApply,
  showPayment = false,
  currentUserId,
  className = ''
}: EnhancedTaskCardProps) {
  const [showFeeBreakdown, setShowFeeBreakdown] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  
  const feeCalculation = calculateFees(amount, taskType)
  const feeInfo = getFeeDisplayInfo(taskType)

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Hard': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTaskTypeColor = (type: TaskType) => {
    switch (type) {
      case 'solo': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'community': return 'bg-green-100 text-green-800 border-green-200'
      case 'barter': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'corporate': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handlePayment = () => {
    if (!currentUserId) {
      onApply?.(id) // Redirect to login
      return
    }
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = (paymentIntentId: string) => {
    console.log('Payment successful:', paymentIntentId)
    onApply?.(id) // Call the apply callback
    setShowPaymentModal(false)
  }

  return (
    <>
      <Card className={`hover:shadow-lg transition-shadow duration-200 ${className}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{title}</CardTitle>
              <CardDescription className="text-sm line-clamp-2">
                {description}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2 ml-4">
              <Badge className={`${getTaskTypeColor(taskType)} capitalize`}>
                {taskType}
              </Badge>
              <Badge className={getDifficultyColor(difficulty)}>
                {difficulty}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Payment Information */}
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg p-4 border border-teal-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-teal-600" />
                <span className="font-semibold text-teal-800">
                  {formatCurrency(amount)}
                </span>
                {feeInfo.displayPercentage !== 'FREE' && (
                  <Badge variant="outline" className="text-xs">
                    {feeInfo.displayPercentage} fee
                  </Badge>
                )}
              </div>
              {taskType === 'barter' && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  No Fees!
                </Badge>
              )}
            </div>

            {taskType !== 'barter' && (
              <div className="text-sm text-teal-700">
                You'll receive: <span className="font-semibold">{feeCalculation.breakdown.net}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="ml-2 h-auto p-0 text-xs text-teal-600 hover:text-teal-800"
                  onClick={() => setShowFeeBreakdown(!showFeeBreakdown)}
                >
                  {showFeeBreakdown ? 'Hide' : 'Show'} breakdown
                </Button>
              </div>
            )}

            {showFeeBreakdown && taskType !== 'barter' && (
              <div className="mt-3 pt-3 border-t border-teal-200">
                <FeeBreakdown 
                  amount={amount} 
                  taskType={taskType}
                  variant="compact"
                  className="bg-white/50"
                />
              </div>
            )}
          </div>

          {/* Task Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>
            {timeEstimate && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{timeEstimate}</span>
              </div>
            )}
            {applicants > 0 && (
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span>{applicants} {applicants === 1 ? 'applicant' : 'applicants'}</span>
              </div>
            )}
          </div>

          {/* Posted By */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${postedBy}`} />
                <AvatarFallback className="text-xs">
                  {postedBy.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <span className="text-gray-600">Posted by </span>
                <span className="font-medium">{postedBy}</span>
                <span className="text-gray-500 ml-1">• {postedAt}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            {showPayment ? (
              <Button 
                onClick={handlePayment}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                {taskType === 'barter' ? 'Start Barter' : 'Pay & Start Task'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={() => onApply?.(id)}
                variant="outline"
                className="w-full border-teal-200 text-teal-700 hover:bg-teal-50"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                View Details & Apply
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        taskId={id}
        taskType={taskType}
        taskTitle={title}
        amount={amount}
        description={description}
        onSuccess={handlePaymentSuccess}
      />
    </>
  )
}

export default EnhancedTaskCard