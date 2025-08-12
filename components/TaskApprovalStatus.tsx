'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, CheckCircle, AlertCircle, XCircle, Flag, Eye } from 'lucide-react'

interface TaskApprovalStatusProps {
  status: 'pending' | 'auto_approved' | 'manual_review' | 'approved' | 'rejected' | 'flagged'
  reviewTier?: 'auto_approve' | 'standard_review' | 'enhanced_review' | 'corporate_review'
  riskScore?: number
  reasons?: string[]
  approvedAt?: string
  approvedBy?: string
  rejectionReason?: string
  className?: string
}

export default function TaskApprovalStatus({
  status,
  reviewTier,
  riskScore,
  reasons,
  approvedAt,
  approvedBy,
  rejectionReason,
  className = ''
}: TaskApprovalStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          label: 'Pending Review',
          description: 'Your task is being reviewed for approval'
        }
      case 'auto_approved':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800 border-green-200',
          label: 'Auto-Approved',
          description: 'Task automatically approved and published'
        }
      case 'manual_review':
        return {
          icon: Eye,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          label: 'Manual Review',
          description: 'Task requires human review before publication'
        }
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800 border-green-200',
          label: 'Approved',
          description: 'Task approved and published to marketplace'
        }
      case 'rejected':
        return {
          icon: XCircle,
          color: 'bg-red-100 text-red-800 border-red-200',
          label: 'Rejected',
          description: 'Task was not approved for publication'
        }
      case 'flagged':
        return {
          icon: Flag,
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          label: 'Flagged',
          description: 'Task flagged for review due to policy concerns'
        }
      default:
        return {
          icon: Clock,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          label: 'Unknown Status',
          description: 'Status unknown'
        }
    }
  }

  const getReviewTierLabel = () => {
    switch (reviewTier) {
      case 'auto_approve': return 'Auto-Approval'
      case 'standard_review': return 'Standard Review'
      case 'enhanced_review': return 'Enhanced Review'
      case 'corporate_review': return 'Corporate Review'
      default: return 'Unknown'
    }
  }

  const getRiskScoreColor = (score?: number) => {
    if (!score) return 'text-green-600'
    if (score < 15) return 'text-green-600'
    if (score < 30) return 'text-yellow-600'
    if (score < 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Card className={`${className} border-2 ${config.color.includes('border') ? config.color.split(' ').find(c => c.includes('border')) : 'border-gray-200'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5" />
            <CardTitle className="text-lg">{config.label}</CardTitle>
          </div>
          <Badge className={config.color}>
            {status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Review Details */}
        {reviewTier && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Review Tier:</span>
            <span className="text-sm">{getReviewTierLabel()}</span>
          </div>
        )}

        {/* Risk Score */}
        {riskScore !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Risk Score:</span>
            <span className={`text-sm font-medium ${getRiskScoreColor(riskScore)}`}>
              {riskScore}/100
            </span>
          </div>
        )}

        {/* Approval Details */}
        {approvedAt && (
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Approved:</span>
              <span className="text-sm">{new Date(approvedAt).toLocaleDateString()}</span>
            </div>
            {approvedBy && (
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Approved By:</span>
                <span className="text-sm capitalize">{approvedBy}</span>
              </div>
            )}
          </div>
        )}

        {/* Rejection Reason */}
        {rejectionReason && status === 'rejected' && (
          <div className="space-y-1">
            <span className="text-sm font-medium text-gray-600">Rejection Reason:</span>
            <p className="text-sm text-red-700 bg-red-50 p-2 rounded">
              {rejectionReason}
            </p>
          </div>
        )}

        {/* Approval Reasons */}
        {reasons && reasons.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-600">
              {status === 'rejected' || status === 'flagged' ? 'Issues:' : 'Assessment:'}
            </span>
            <ul className="space-y-1">
              {reasons.map((reason, index) => (
                <li key={index} className="text-xs bg-gray-50 p-2 rounded">
                  • {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Help Text */}
        {(status === 'manual_review' || status === 'pending') && (
          <div className="text-xs text-gray-500 border-t pt-3">
            <p>
              <strong>What happens next:</strong> Our team will review your task within 24 hours. 
              You'll receive an email notification once it's approved or if we need more information.
            </p>
          </div>
        )}

        {status === 'rejected' && (
          <div className="text-xs text-gray-500 border-t pt-3">
            <p>
              <strong>Next steps:</strong> You can edit your task to address the issues mentioned above, 
              or contact support if you believe this was an error.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}